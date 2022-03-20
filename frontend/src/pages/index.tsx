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
  Textarea,
} from '@mantine/core'
import { ExternalLink } from 'tabler-icons-react'
import { Modal } from '../components/modal'
import { Layout } from '../components/layout'

export type Config = {
  domains: DomainInfo[]
  url: string
  extension: boolean
  embed: boolean
  color: string
  title: string
  description: string
}

export type DomainInfo = {
  name: string
  real: boolean
}

const domainArray = ['daba.by']
const shareX: any = {
  Version: '13.1.0',
  Name: 'host - files/images',
  DestinationType: 'ImageUploader, FileUploader',
  RequestMethod: 'POST',
  RequestURL: 'https://daba.by/create',
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
  shareX.Arguments.extension = config.extension
  shareX.Arguments.embed = config.embed
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
    domains: [{ name: 'daba.by', real: true }],
    url: 'normal',
    extension: false,
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
              getCreateLabel={(query) => `+ create ${query}`}
              onChange={(data) => {
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
              onChange={(data) => {
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
              onChange={(data) =>
                updateConfig({
                  ...config,
                  extension: data.currentTarget.checked,
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
              onChange={(data) =>
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
                onChange={(data) => updateConfig({ ...config, color: data })}
              />
            </Group>
            <Group position="apart" style={{ marginBottom: 14 }}>
              <Text>Title</Text>
              <TextInput
                placeholder="Title"
                value={config.title}
                style={{ width: '25%' }}
                onChange={(data) =>
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
                onChange={(data) =>
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
            href="https://daba.by/docs"
            style={{ marginTop: 14 }}
          >
            Docs
          </Button>
        </Card>
      </div>
    </Layout>
  )
}
