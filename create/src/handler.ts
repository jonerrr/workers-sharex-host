import { Domain, Metadata } from './types'
import { nanoid } from 'nanoid'
import urlRegex from 'url-regex-safe'
import { escape } from 'lodash'
import { Chance } from 'chance'
import { getExtension } from 'mime/lite'

declare global {
  // Vars
  const ORIGINS: string
  const METHODS: string
  const RAW: string
  const RETRIEVE_DOMAIN: string
  const DEFAULT_DOMAIN: string
  const SPOILER_CHARS: string
  // Namespaces
  const DATA: KVNamespace
}

const chance = new Chance()

export async function handleRequest(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS')
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': ORIGINS,
        'Access-Control-Allow-Methods': METHODS,
        'access-control-allow-headers': 'content-type',
      },
    })

  if (request.method !== 'POST')
    return response(
      JSON.stringify({ message: 'Invalid method' }),
      405,
      'application/json',
    )
  if (!request.headers.get('content-type')?.startsWith('multipart/form-data'))
    return response(
      { message: 'Invalid content type' },
      415,
      'application/json',
    )

  const form = await request.formData()
  if (
    !form.has('data') ||
    !form.has('type') ||
    !form.has('embed') ||
    !form.has('domains') ||
    !form.has('url')
  )
    return response({ message: 'Missing parameters' }, 403, 'application/json')

  let data: File | string | ArrayBuffer | null

  const metadata: Metadata = {}

  const ttl = form.get('ttl')
  if (ttl && typeof ttl === 'string') {
    const time = parseInt(ttl)
    if (time < 60)
      return response(
        {
          message: `Invalid TTL (make sure it's greater than 60 seconds)`,
        },
        403,
        'application/json',
      )
    metadata.expire = time
  }

  let id =
    form.get('url') === 'invisible'
      ? chance.string({
          length: 56,
          pool: ['\u200B', '\u200C'].join(''),
        })
      : nanoid(10)

  switch (form.get('type')) {
    case 'url':
      data = form.get('data')
      if (
        typeof data !== 'string' ||
        !data.match(urlRegex({ exact: true })) ||
        data.length > 26214400
      )
        return response({ message: 'Invalid url' }, 400, 'application/json')
      if (!data.match(/(https?:\/\/)/gi)) data = `https://${data}`
      metadata.size = data.length
      break
    case 'file':
      data = form.get('data')
      if (
        !data ||
        typeof data !== 'object' ||
        !data.type.match(/\w+\/[-+.\w]+/g) ||
        data.size > 26214400
      )
        return response({ message: 'Invalid file' }, 400, 'application/json')
      metadata.mime = data.type
      metadata.extension = data.name.split('.').pop()

      if (form.get('extension') === 'true')
        id = `${id}.${
          metadata.extension ? metadata.extension : getExtension(data.type)
        }`

      data = await data.arrayBuffer()
      metadata.size = data.byteLength
      break
    default:
      return response(
        { message: 'Invalid data type (must be url or file)' },
        415,
        'application/json',
      )
  }
  metadata.type = form.get('type') as 'url' | 'file'

  if (metadata.mime?.startsWith('image'))
    metadata.embedData = `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${RAW}/${id}"><meta name="twitter:image:src" content="${RAW}/${id}"><meta property="og:image" content="${RAW}/${id}">`
  if (metadata.mime?.startsWith('video'))
    metadata.embedData = `<meta name="twitter:card" content="player"><meta name="twitter:player" content="${RAW}/${id}"><meta name="twitter:player:stream" content="${RAW}/${id}"><meta name="twitter:player:stream:content_type" content="${metadata.mime}">`

  if (form.get('embed') === 'true' && metadata.type === 'file') {
    const color = form.get('color') as string | null
    if (color) {
      if (color === 'random')
        metadata.embedData += `<meta name="theme-color" content="${chance.color(
          { format: 'hex' },
        )}">`
      if (
        color.match(
          /(?:#|0x)(?:[a-f0-9]{3}|[a-f0-9]{6})\b|(?:rgb|hsl)a?\([^)]*\)/gi,
        )
      )
        metadata.embedData = `${
          metadata.embedData
        }<meta name="theme-color" content="${escape(color)}">`
    }

    const title = form.get('title')
    if (title && typeof title === 'string')
      metadata.embedData = `${
        metadata.embedData
      }<meta name="twitter:title" content="${escape(
        title,
      )}"><meta property="og:title" content="${escape(title)}">`

    const description = form.get('description')
    if (description && typeof description === 'string')
      metadata.embedData = `${
        metadata.embedData
      }<meta name="twitter:description" content="${escape(
        description,
      )}"><meta property="og:description" content="${escape(description)}">`
  }
  metadata.deletionCode = nanoid()
  metadata.timezone = request.cf?.timezone || 'America/New_York'

  metadata.time = Date.now()

  const url = new URL(request.url)
  const transport = url.searchParams.get('transport')
  if (transport === 'true') {
    await DATA.put(request.headers.get('CF-Connecting-IP') as string, data, {
      metadata,
      // 24 hours
      expirationTtl: 86400,
    })
    return response({ url: `${RETRIEVE_DOMAIN}/t` }, 200, 'application/json')
  }

  let domain: string | string[] | Domain = form.has('domains')
    ? (form.get('domains') as string)
    : DEFAULT_DOMAIN
  domain = domain.replace(/\s+/g, '').split('>')
  domain.pop()
  const domainsParsed: Domain[] = []
  try {
    for (const d of domain) {
      const split = d.split('<')
      domainsParsed.push({ name: split[0], real: split[1] === 'real' })
    }
    domain = domainsParsed[Math.floor(Math.random() * domainsParsed.length)]

    await DATA.put(encodeURI(id), data, {
      metadata,
      expirationTtl: metadata.expire,
    })

    return response(
      {
        url: `${
          domain.real
            ? `https://${domain.name}`
            : `${domain.name}${SPOILER_CHARS}${RETRIEVE_DOMAIN}`
        }/${id}`,
        raw: `${RAW}/${id}`,
        deletionURL: `${RETRIEVE_DOMAIN}/${id}?delete=${metadata.deletionCode}`,
      },
      200,
      'application/json',
    )
  } catch (e) {
    console.log(e)
    return response(
      { message: 'Internal server error' },
      500,
      'application/json',
    )
  }
}

function response(
  data: unknown,
  status: number,
  contentType: string,
): Response {
  return new Response(
    JSON.stringify({
      success: !!status.toString().match(/20[01]/gm),
      data,
    }),
    {
      status: status,
      headers: {
        'content-type': contentType,
        'access-control-allow-origin': ORIGINS,
        'access-control-allow-methods': METHODS,
        'access-control-allow-headers': 'content-type',
      },
    },
  )
}
