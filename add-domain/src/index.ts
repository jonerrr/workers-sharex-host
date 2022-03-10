import config from '../config.json'
import { default as axios } from 'axios'
import prompt from 'prompt'

;(async () => {
  const schema = {
    properties: {
      domain: {
        pattern:
          /^(((?!\-))(xn\-\-)?[a-z0-9\-_]{0,61}[a-z0-9]{1,1}\.)*(xn\-\-)?([a-z0-9\-]{1,61}|[a-z0-9\-]{1,30})\.[a-z]{2,}$/,
        message: 'Invalid domain name',
        required: true,
      },
    },
  }

  let zone
  const instance = axios.create({
    baseURL: 'https://api.cloudflare.com/client/v4',
    headers: {
      'X-Auth-Key': config.key,
      'X-Auth-Email': config.email,
    },
  })

  try {
    prompt.start()
    const { e, domain } = await prompt.get(schema)
    if (e) throw new Error('Error reading domain name')

    const createZone = await instance({
      url: '/zones',
      method: 'POST',
      data: {
        name: domain,
        account: { id: config.account },
      },
    })
    zone = createZone.data.result.id
    const ns = createZone.data.result.name_servers

    console.log(
      `Domain added\nZone ID: ${zone}\nName Servers: ${ns}\nNow configuring domain settings, DNS records and worker routes`,
    )

    await instance({
      url: `/zones/${zone}/settings/brotli`,
      method: 'PATCH',
      data: { value: 'on' },
    })
    console.log('Brotli enabled')

    await instance({
      url: `/zones/${zone}/settings/early_hints`,
      method: 'PATCH',
      data: { value: 'on' },
    })
    console.log('Early hints enabled')

    await instance({
      url: `/zones/${zone}/settings/rocket_loader`,
      method: 'PATCH',
      data: { value: 'on' },
    })
    console.log('Rocket loader enabled')

    await instance({
      url: `/zones/${zone}/settings/browser_cache_ttl`,
      method: 'PATCH',
      data: { value: 0 },
    })
    console.log('Cache TTL set to respect existing headers')

    await instance({
      url: `/zones/${zone}/settings/always_use_https`,
      method: 'PATCH',
      data: { value: 'on' },
    })
    console.log('Always use HTTPS enabled')

    await instance({
      url: `/zones/${zone}/settings/dns_records`,
      method: 'POST',
      data: {
        type: 'AAAA',
        name: domain,
        content: '100::',
        proxied: true,
        ttl: 3600,
      },
    })
    await instance({
      url: `/zones/${zone}/settings/dns_records`,
      method: 'POST',
      data: {
        type: 'AAAA',
        name: `api.${domain}`,
        content: '100::',
        proxied: true,
        ttl: 3600,
      },
    })
    console.log('DNS records created')

    instance({
      url: `/zones/${zone}/workers/routes`,
      method: 'POST',
      data: {
        pattern: `${domain}/*`,
        script: config.receive,
      },
    })
    console.log('Receive route added')

    await instance({
      url: `/zones/${zone}/workers/routes`,
      method: 'POST',
      data: {
        pattern: `${domain}/raw/*`,
        script: config.raw,
      },
    })
    console.log('Raw route added')

    await instance({
      url: `/zones/${zone}/workers/routes`,
      method: 'POST',
      data: {
        pattern: `api.${domain}/c`,
        script: config.create,
      },
    })
    console.log('Create route added')

    await instance({
      url: `/zones/${zone}/workers/routes`,
      method: 'POST',
      data: {
        pattern: `api.${domain}/d`,
        script: config.delete,
      },
    })
    console.log('Delete route added')

    //TODO route for frontend

    console.log(
      `Process finished, don't forget to change your Nameservers to \n${ns}.`,
    )
  } catch (e) {
    console.log(e)

    await instance({ url: `/zones/${zone}`, method: 'DELETE' })
    console.log('Domain deleted due to unknown error')
    process.exit(1)
  }
})()
