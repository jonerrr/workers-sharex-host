import * as React from 'react'
import {
  Switch,
  Card,
  Text,
  Button,
  Group,
  useMantineTheme,
  Title,
  SegmentedControl,
  MultiSelect,
  Collapse,
  ColorInput,
  TextInput,
  Checkbox,
  Textarea,
  NumberInput,
} from '@mantine/core'
import { Check, ExternalLink } from 'tabler-icons-react'
import { Modal } from '../components/modal'
import { Layout } from '../components/layout'

export type Config = {
  domains: DomainInfo[]
  url: string
  extension: boolean
  ttl?: number
  embed: boolean
  color: string
  title: string
  description: string
}

export type DomainInfo = {
  name: string
  real: boolean
}

const domainArray = ['daba.by', 'i.jnr.cx']
const shareX: any = {
  Version: '13.1.0',
  Name: 'host - files/images',
  DestinationType: 'ImageUploader, FileUploader',
  RequestMethod: 'POST',
  RequestURL: 'https://api.jnr.cx/create',
  Body: 'MultipartFormData',
  Arguments: {},
  FileFormName: 'data',
  URL: '$json:data:url$',
  DeletionURL: '$json:deletionURL',
  ErrorMessage: '$json:data:message',
}

const generateConfig = (config: Config) => {
  let parsedDomains = ''
  config.domains.forEach(
    (d) =>
      (parsedDomains = `${parsedDomains}${d.name}<${
        d.real ? 'real' : 'fake'
      }>`),
  )

  shareX.Arguments.domains = parsedDomains
  shareX.Arguments.url = config.url
  shareX.Arguments.type = 'file'
  shareX.Arguments.extension = config.extension
  shareX.Arguments.embed = config.embed
  shareX.Arguments.ttl = config.ttl
  if (config.embed) {
    if (config.color && config.color !== '')
      shareX.Arguments.color = config.color
    if (config.title && config.title !== '')
      shareX.Arguments.title = config.title
    if (config.description && config.description !== '')
      shareX.Arguments.description = config.description
  }
  return `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(shareX),
  )}`
}

export default function Index() {
  const theme = useMantineTheme()

  const [config, updateConfig] = React.useState<Config>({
    domains: [{ name: 'i.jnr.cx', real: true }],
    url: 'normal',
    extension: false,
    ttl: undefined,
    embed: false,
    color: '',
    title: '',
    description: '',
  })
  const shareXconfig = generateConfig(config)

  return (
    <Layout>
      <div
        style={{
          width: '100%',
          margin: 'auto',
          padding: theme.spacing.md,
        }}
      >
        <Card shadow="sm">
          <Group
            position="center"
            style={{ marginBottom: 5, marginTop: theme.spacing.sm }}
          >
            <Title order={2}>Config Creator</Title>
          </Group>

          <Group position="apart" style={{ marginBottom: 14 }}>
            <Text>Domains</Text>
            <MultiSelect
              style={{ minWidth: '25%', maxWidth: '50%' }}
              data={domainArray}
              value={config.domains.map((d) => d.name)}
              placeholder="Select Domains"
              searchable
              creatable
              getCreateLabel={(query: any) => `+ create ${query}`}
              onChange={(data: any) => {
                const domains: DomainInfo[] = []
                for (const d of data)
                  domains.push({ name: d, real: domainArray.includes(d) })
                updateConfig({ ...config, domains })
              }}
            />
          </Group>

          <Group position="apart" style={{ marginBottom: 14 }}>
            <Text>URL</Text>
            <SegmentedControl
              value={config.url}
              onChange={(data: string) => {
                const newConfig = { ...config, url: data }
                if (data === 'invisible' && config.extension)
                  newConfig.extension = false
                updateConfig(newConfig)
              }}
              data={['normal', 'invisible']}
            />
          </Group>

          <Group position="apart" style={{ marginBottom: 14 }}>
            <Text>File Extension</Text>
            <Switch
              onLabel="ON"
              offLabel="OFF"
              size="lg"
              disabled={config.url === 'invisible'}
              checked={config.extension}
              onChange={(data: { currentTarget: { checked: any } }) =>
                updateConfig({
                  ...config,
                  extension: data.currentTarget.checked,
                })
              }
            />
          </Group>

          <Group position="apart" style={{ marginBottom: 14 }}>
            <Text>Time to live</Text>
            <NumberInput
              placeholder="120 seconds"
              min={60}
              value={config.ttl}
              onChange={(val: any) =>
                updateConfig({
                  ...config,
                  ttl: val,
                })
              }
            />
          </Group>

          <Group position="apart" style={{ marginBottom: 14 }}>
            <Text>Embed</Text>
            <Switch
              onLabel="ON"
              offLabel="OFF"
              size="lg"
              checked={config.embed}
              onChange={(data: { currentTarget: { checked: any } }) =>
                updateConfig({ ...config, embed: data.currentTarget.checked })
              }
            />
          </Group>
          <Collapse in={config.embed}>
            <Group position="apart" style={{ marginBottom: 14 }}>
              <Text>Color</Text>
              <ColorInput
                placeholder="Pick color"
                value={config.color}
                onChange={(data: any) => updateConfig({ ...config, color: data })}
              />
            </Group>
            <Group position="apart" style={{ marginBottom: 14 }}>
              <Text>Random Color</Text>
              <Checkbox
                size="lg"
                checked={config.color === 'random'}
                onChange={(data: any) =>
                  updateConfig({
                    ...config,
                    color: config.color === 'random' ? '' : 'random',
                  })
                }
              />
            </Group>
            <Group position="apart" style={{ marginBottom: 14 }}>
              <Text>Title</Text>
              <TextInput
                placeholder="Title"
                value={config.title}
                style={{ width: '25%' }}
                onChange={(data: { currentTarget: { value: any } }) =>
                  updateConfig({ ...config, title: data.currentTarget.value })
                }
              />
            </Group>
            <Group position="apart" style={{ marginBottom: 14 }}>
              <Text>Description</Text>
              <Textarea
                placeholder="Description"
                value={config.description}
                style={{ width: '25%' }}
                autosize
                minRows={2}
                maxRows={4}
                onChange={(data: { currentTarget: { value: any } }) =>
                  updateConfig({
                    ...config,
                    description: data.currentTarget.value,
                  })
                }
              />
            </Group>
          </Collapse>

          <Button
            variant="light"
            color="blue"
            fullWidth
            size="lg"
            component="a"
            href={shareXconfig}
            download="config.sxcu"
            disabled={config.domains.length === 0}
            style={{ marginTop: 14 }}
          >
            Download
          </Button>
          <Modal config={config} />
          <Button
            variant="light"
            color="orange"
            fullWidth
            size="lg"
            component="a"
            target="_blank"
            leftIcon={<ExternalLink size={14} />}
            rel="noopener noreferrer"
            href="https://api.jnr.cx/docs"
            style={{ marginTop: 14 }}
          >
            Docs
          </Button>
        </Card>
      </div>
    </Layout>
  )
}
