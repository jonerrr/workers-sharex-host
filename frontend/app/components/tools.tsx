import {
  Switch,
  Text,
  Button,
  Group,
  Textarea,
  TextInput,
  Tabs,
  useMantineTheme,
  MantineTheme,
} from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { useModals } from '@mantine/modals'
import { useNotifications } from '@mantine/notifications'
import { Dropzone, DropzoneStatus } from '@mantine/dropzone'
import { useState } from 'react'
import { Upload, Link, FileText, FileUpload, X } from 'tabler-icons-react'

type CreateResponse = {
  success: boolean
  data: CreateResponseData
}
type CreateResponseData = {
  message?: string
  url?: string
  deletionURL?: string
}

function ImageUploadIcon({
  status,
  ...props
}: React.ComponentProps<TablerIcon> & { status: DropzoneStatus }) {
  if (status.accepted) {
    return <Upload {...props} />
  }

  if (status.rejected) {
    return <X {...props} />
  }

  return <FileUpload {...props} />
}

function getIconColor(status: DropzoneStatus, theme: MantineTheme) {
  return status.accepted
    ? theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]
    : status.rejected
    ? theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]
    : theme.colorScheme === 'dark'
    ? theme.colors.dark[0]
    : theme.colors.gray[7]
}

export const dropzoneChildren = (
  status: DropzoneStatus,
  theme: MantineTheme,
) => (
  <Group
    position="center"
    spacing="xl"
    style={{ minHeight: 220, pointerEvents: 'none' }}
  >
    <ImageUploadIcon
      status={status}
      style={{ color: getIconColor(status, theme) }}
      size={80}
    />

    <div>
      <Text size="xl" inline>
        Drag files or click to upload
      </Text>
      <Text size="sm" color="dimmed" inline mt={7}>
        One file at a time, must not exceed 25mb
      </Text>
    </div>
  </Group>
)

export const ToolsModal = () => {
  const modals = useModals()
  const theme = useMantineTheme()
  const notifications = useNotifications()
  const clipboard = useClipboard()

  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState('')
  const [paste, setPaste] = useState('')

  const openToolsModal = () => {
    modals.openModal({
      title: 'Tools',
      children: (
        <>
          <Tabs tabPadding="sm">
            <Tabs.Tab label="Upload" icon={<Upload size={14} />}>
              <Dropzone
                onDrop={async (files) => {
                  setLoading(true)
                  const form = new FormData()
                  form.append('data', files[0])
                  form.append('embed', 'false')
                  form.append('extension', 'false')
                  form.append('url', 'normal')
                  form.append('domains', 'daba.by<real>')
                  form.append('type', 'file')

                  const result = await fetch('https://daba.by/create', {
                    method: 'POST',
                    body: form,
                  })
                  const resultJSON: CreateResponse = await result.json()

                  if (resultJSON.success || resultJSON.data.url) {
                    clipboard.copy(resultJSON.data.url)
                    console.log(clipboard.copied)
                    notifications.showNotification({
                      title: 'Success',
                      message: 'File uploaded, URL copied to clipboard',
                      color: 'teal',
                    })
                  } else {
                    notifications.showNotification({
                      title: 'Error',
                      message: resultJSON.data.message,
                      color: 'red',
                    })
                  }
                  setLoading(false)
                }}
                onReject={(files) => console.log('rejected files', files)}
                maxSize={25000000}
                multiple={false}
                loading={loading}
              >
                {(status) => dropzoneChildren(status, theme)}
              </Dropzone>
            </Tabs.Tab>
            <Tabs.Tab label="Shorten" icon={<Link size={14} />}>
              <Group>
                <TextInput
                  variant="default"
                  placeholder="URL"
                  value={url}
                  onChange={(data) => setUrl(data.currentTarget.value)}
                />
                <Button>Shorten</Button>
              </Group>
            </Tabs.Tab>
            <Tabs.Tab label="Paste" icon={<FileText size={14} />}>
            <Group>
                <TextInput
                  variant="default"
                  placeholder="Paste"
                  value={paste}
                  onChange={(data) => setPaste(data.currentTarget.value)}
                />
                <Button>Shorten</Button>
              </Group>
            </Tabs.Tab>
          </Tabs>
        </>
      ),
    })
  }

  return (
    <Button
      variant="light"
      color="teal"
      fullWidth
      onClick={openToolsModal}
      style={{ marginTop: 14 }}
    >
      Tools
    </Button>
  )
}
