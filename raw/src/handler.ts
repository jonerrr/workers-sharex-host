import { Metadata } from './types'

declare global {
  // Vars
  const ORIGINS: string
  const METHODS: string
  // Namespaces
  const DATA: KVNamespace
}

export async function handleRequest(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS')
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': ORIGINS,
        'Access-Control-Allow-Methods': METHODS,
        'access-control-allow-headers': 'content-type',
      },
    })
  if (request.method !== 'GET')
    return response({ message: 'Invalid method' }, 405, 'application/json')

  const url = new URL(request.url)
  const key = url.pathname.split('/').pop()
  console.log(key)
  if (!key || key.length < 10)
    return response({ message: 'Invalid file code' }, 400, 'application/json')

  // Getting the data ID from the URL path can be different depending on how the routes are set up.
  const data: KVNamespaceGetWithMetadataResult<ArrayBuffer, Metadata> =
    await DATA.getWithMetadata(
      url.pathname.split('/').pop() as string,
      'arrayBuffer',
    )
  if (!data.value || !data.metadata)
    return response({ message: 'Data not found' }, 404, 'application/json')

  if (data.metadata?.type === 'url')
    return Response.redirect(new TextDecoder().decode(data.value), 308)

  return new Response(data.value, {
    status: 200,
    headers: {
      'content-type': data.metadata?.type || 'application/octet-stream',
      'access-control-allow-origin': ORIGINS,
      'cache-control': 'max-age=31536000',
      'access-control-allow-methods': METHODS,
      'access-control-allow-headers': 'content-type',
    },
  })
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
