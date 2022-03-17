import {
  Switch,
  Card,
  Text,
  Button,
  Group,
  useMantineTheme,
  Title,
  MultiSelect,
} from '@mantine/core'
import { useState } from 'react'

type DomainInfo = {
  name: string
  real: boolean
}

export default function Index() {
  const theme = useMantineTheme()
  const [config, updateConfig] = useState({
    // Set the domains here
    domains: [{ name: 'daba.by', real: true }],
    url: 'normal',
    extension: false,
    embed: false,
    color: '#FFFFF',
    title: '',
    description: '',
  })

  return (
    <div style={{ width: 340, margin: 'auto', padding: theme.spacing.md }}>
      <Card shadow="sm" padding="lg">
        <Group
          position="apart"
          style={{ marginBottom: 5, marginTop: theme.spacing.sm }}
        >
          <Title order={2}>Config Creator</Title>
        </Group>

        <Group position="apart">
          <Text>Domains</Text>
          <MultiSelect
            data={config.domains.map((d) => d.name)}
            placeholder="Select Domains"
            searchable
            creatable
            getCreateLabel={(query) => `+ create ${query}`}
            onCreate={(query) => {}}
          />
        </Group>

        <Button
          variant="light"
          color="blue"
          fullWidth
          style={{ marginTop: 14 }}
        >
          Download
        </Button>
        <Button
          variant="light"
          color="blue"
          fullWidth
          style={{ marginTop: 14 }}
        >
          Tools
        </Button>
      </Card>
    </div>
  )
}
