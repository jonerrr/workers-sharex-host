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
import { ToolsModal } from '~/components/tools'
import { useState } from 'react'

type DomainInfo = {
  name: string
  real: boolean
}

const domainArray = ['daba.by']

export default function Index() {
  const theme = useMantineTheme()

  const [config, updateConfig] = useState({
    domains: [{ name: 'daba.by', real: true }],
    url: 'normal',
    extension: false,
    embed: false,
    color: '',
    title: '',
    description: '',
  })

  console.log(config)

  return (
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
            data={config.domains.map((d) => d.name)}
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
              updateConfig({ ...config, extension: data.currentTarget.checked })
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
          disabled={!config.domains.length}
          style={{ marginTop: 14 }}
        >
          Download
        </Button>
        <ToolsModal />
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
  )
}
