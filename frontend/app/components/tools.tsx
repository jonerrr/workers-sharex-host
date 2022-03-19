import {
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
import urlRegex from 'url-regex-safe'
import {
  Upload,
  Link,
  FileText,
  FileUpload,
  X,
  Icon as TablerIcon,
} from 'tabler-icons-react'

type CreateResponse = {
  success: boolean
  data: CreateResponseData
}
type CreateResponseData = {
  message?: string
  url?: string
  deletionURL?: string
}

function FileUploadIcon({
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
    <FileUploadIcon
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

const ShortenTab = () => {
  const clipboard = useClipboard()
  const notifications = useNotifications()

  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <Group position="apart">
      <TextInput
        variant="default"
        style={{ minWidth: '60%', maxWidth: '70%' }}
        placeholder="URL"
        value={url}
        onChange={(data) => setUrl(data.currentTarget.value)}
        error={
          !url.match(urlRegex({ exact: true })) && url !== ''
            ? 'Invalid URL'
            : false
        }
      />
      <Button
        loading={loading}
        disabled={!url.match(urlRegex({ exact: true }))}
        onClick={async () => {
          setLoading(true)
          const form = new FormData()
          form.append('data', url)
          form.append('embed', 'false')
          form.append('url', 'normal')
          form.append('domains', 'daba.by<real>')
          form.append('type', 'url')

          const result = await fetch('https://daba.by/create', {
            method: 'POST',
            body: form,
          })
          const resultJSON: CreateResponse = await result.json()

          if (resultJSON.success || resultJSON.data.url) {
            clipboard.copy(resultJSON.data.url)
            notifications.showNotification({
              title: 'Success',
              message: 'Shortened URL copied to clipboard',
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
      >
        Shorten
      </Button>
    </Group>
  )
}

const PasteTab = () => {
  const clipboard = useClipboard()
  const notifications = useNotifications()

  const [paste, setPaste] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <Group position="apart">
      <Textarea
        variant="default"
        placeholder="Paste"
        style={{ minWidth: '60%', maxWidth: '70%' }}
        autosize
        minRows={3}
        maxRows={5}
        value={paste}
        onChange={(data) => setPaste(data.currentTarget.value)}
      />
      <Button
        disabled={paste === ''}
        loading={loading}
        onClick={async () => {
          setLoading(true)

          const form = new FormData()
          form.append(
            'data',
            new File([new Blob([paste], { type: 'text/plain' })], 'paste.txt', {
              type: 'text/plain',
            }),
          )
          form.append('embed', 'false')
          form.append('url', 'normal')
          form.append('domains', 'daba.by<real>')
          form.append('type', 'file')

          const result = await fetch('https://daba.by/create', {
            method: 'POST',
            body: form,
          })
          const resultJSON: CreateResponse = await result.json()

          if (resultJSON.success && resultJSON.data.url) {
            clipboard.copy(resultJSON.data.url)
            console.log(clipboard.copied)
            console.log(clipboard.error)

            console.log(resultJSON)
            notifications.showNotification({
              title: 'Success',
              message: 'Paste created, URL copied to clipboard',
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
      >
        Paste
      </Button>
    </Group>
  )
}

export const ToolsModal = () => {
  const modals = useModals()
  const theme = useMantineTheme()
  const notifications = useNotifications()
  const clipboard = useClipboard()

  const [loading, setLoading] = useState(false)

  const openToolsModal = () => {
    modals.openModal({
      title: 'Tools',
      children: (
        <>
          <Tabs tabPadding="sm" grow position="center">
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
              <ShortenTab />
            </Tabs.Tab>
            <Tabs.Tab label="Paste" icon={<FileText size={14} />}>
              <PasteTab />
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
      size="lg"
      onClick={openToolsModal}
      style={{ marginTop: 14 }}
    >
      Tools
    </Button>
  )
}
