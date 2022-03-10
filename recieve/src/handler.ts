import { getExtension } from 'mime/lite'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Metadata } from './types'
import { genHTML } from './html'

dayjs.extend(relativeTime)

declare global {
  // Vars
  const ORIGINS: string
  const METHODS: string
  const RAW: string
  const DELETION_API: string
  // Namespaces
  const DATA: KVNamespace
}

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const dataCode = url.pathname.substring(1)
  const deletionCode = url.searchParams.get('delete')
  if (!dataCode || dataCode.length < 10)
    return response({ message: 'Invalid data code' }, 400, 'application/json')

  const data: KVNamespaceGetWithMetadataResult<ArrayBuffer, Metadata> =
    await DATA.getWithMetadata(dataCode, 'arrayBuffer')
  if (!data.value || !data.metadata)
    return response({ message: 'Data not found' }, 404, 'application/json')

  if (data.metadata.type === 'url')
    return Response.redirect(new TextDecoder().decode(data.value), 308)

  const type = data.metadata.mime?.split('/')[0]

  let element: string
  switch (type) {
    case 'audio':
      element = `
    <audio controls>
        <source src="${RAW}/${dataCode}">
        Your browser does not support the audio element.
    </audio>`
      break
    case 'video':
      element = `
           <video controls>
            <source src="${RAW}/${dataCode}"/>
            Your browser does not support the audio element.
        </video>`
      break
    case 'text':
      element = `<p class="text-white text-start" id="textData">
       ${new TextDecoder().decode(data.value)}
        </p>`
      break
    case 'image':
      element = `<img class="d-block mx-auto mb-4 img-fluid"
             src="${RAW}/${dataCode}">`
      break
    default:
      element = `
        <div class="d-grid gap-3 p-3 justify-content-sm-center">
        <p class="h5 text-white">This file is not viewable, click below to download.</p>
        <a class="btn btn-primary btn-lg" href="${RAW}/${dataCode}" role="button" download="${dataCode}.${getExtension(
        data.metadata.mime,
      )}">Download</a>
    </div>`
      break
  }

  return new Response(
    genHTML(
      type,
      dataCode,
      element,
      dayjs(data.metadata.time).fromNow(),
      data.metadata.size / 1000,
      deletionCode,
      data.metadata.embedData,
    ),
    {
      status: 200,
      headers: {
        'content-type': 'text/html',
      },
    },
  )
}

function response(data: any, status: number, contentType: string): Response {
  return new Response(
    JSON.stringify({
      success: !!status.toString().match(/20[01]/gm),
      data,
    }),
    {
      status: status,
      headers: {
        'content-type': contentType,
      },
    },
  )
}
