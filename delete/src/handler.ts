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

  if (request.method !== 'POST')
    return response({ message: 'Invalid method' }, 405, 'application/json')
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return response(
      { message: 'Invalid content type' },
      400,
      'application/json',
    )

  const body: { deletionCode?: string; dataCode?: string } =
    await request.json()
  if (
    !body.deletionCode ||
    body.deletionCode.length !== 21 ||
    !body.dataCode ||
    body.dataCode.length < 10
  )
    return response(
      { message: 'Invalid deletion or data code' },
      403,
      'application/json',
    )

  const data: KVNamespaceGetWithMetadataResult<string, Metadata> =
    await DATA.getWithMetadata(body.dataCode)
  if (!data || data.metadata?.deletionCode !== body.deletionCode)
    return response(
      { message: 'Invalid deletion code' },
      403,
      'application/json',
    )

  await DATA.delete(body.dataCode)

  return response({ message: 'Data deleted' }, 200, 'application/json')
}

function response(data: unknown, status: number, contentType: string): Response {
  return new Response(
    JSON.stringify({
      success: !!status.toString().match(/20[01]/gm),
      data,
    }),
    {
      status: status,
      headers: {
        'Content-Type': contentType,
        'access-control-allow-headers': 'content-type',
        'Access-Control-Allow-Origin': ORIGINS,
        'Access-Control-Allow-Methods': METHODS,
        'Access-Control-Allow-Credentials': 'true',
      },
    },
  )
}
