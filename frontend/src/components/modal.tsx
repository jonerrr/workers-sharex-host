import * as React from 'react'
import {
  Modal as MantineModal,
  Button,
  Tabs,
  TextInput,
  Group,
  Textarea,
  Center,
} from '@mantine/core'
import { useClipboard, getHotkeyHandler } from '@mantine/hooks'
import { useNotifications } from '@mantine/notifications'
import { Dropzone } from '@mantine/dropzone'
import { dropzoneChildren } from './dropzone'
import urlRegex from 'url-regex-safe'
import { Upload, Link, FileText } from 'tabler-icons-react'
import { Config } from '../pages'

type CreateResponse = {
  success: boolean
  data: CreateResponseData
}
type CreateResponseData = {
  message?: string
  url?: string
  deletionURL?: string
}

const CreateData = async (
  type: 'url' | 'file',
  data: File | string,
  config: Config,
): Promise<CreateResponse> => {
  const form = new FormData()
  console.log(data)
  let parsedDomains = ''
  console.log(config.domains)
  config.domains.forEach(
    (d) =>
      (parsedDomains = `${parsedDomains}${d.name}<${
        d.real ? 'real' : 'fake'
      }>`),
  )
  form.append('domains', parsedDomains)
  form.append('embed', config.embed ? 'true' : 'false')
  form.append('url', config.url)
  form.append('type', type)
  form.append('data', data)
  form.append('extension', config.extension ? 'true' : 'false')
  if (config.embed) {
    if (config.color && config.color !== '') form.append('color', config.color)
    if (config.title && config.title !== '') form.append('title', config.title)
    if (config.description && config.description !== '')
      form.append('description', config.description)
  }

  const result = await fetch('https://daba.by/create', {
    method: 'POST',
    body: form,
  })
  return await result.json()
}

type ModalProps = {
  config: Config
}

export const Modal = ({ config }: ModalProps) => {
  const notifications = useNotifications()
  const clipboard = useClipboard()

  const [opened, setOpened] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [url, setUrl] = React.useState('')
  const [paste, setPaste] = React.useState('')

  const success = (message: string, url: string) => {
    notifications.showNotification({
      title: 'Success',
      message,
      color: 'teal',
    })
    clipboard.copy(url)
  }
  const error = (message: string) =>
    notifications.showNotification({
      title: 'Error',
      message,
      color: 'red',
    })

  return (
    <>
      <MantineModal
        centered
        title="Tools"
        size="lg"
        opened={opened}
        onClose={() => setOpened(false)}
      >
        <Tabs tabPadding="sm" grow position="center">
          <Tabs.Tab label="Upload" icon={<Upload size={14} />}>
            <Dropzone
              onDrop={async (files) => {
                setLoading(true)
                const json = await CreateData('file', files[0], config)
                json.success
                  ? success(
                      'File uploaded, URL copied to clipboard',
                      json.data.url as string,
                    )
                  : error(json.data.message as string)
                setLoading(false)
              }}
              maxSize={25000000}
              multiple={false}
              loading={loading}
            >
              {(status) => dropzoneChildren(status)}
            </Dropzone>
          </Tabs.Tab>
          <Tabs.Tab label="Paste" icon={<FileText size={14} />}>
            <Textarea
              variant="default"
              placeholder="Paste"
              autosize
              minRows={2}
              maxRows={10}
              value={paste}
              onChange={(data) => setPaste(data.currentTarget.value)}
            />
            <Center>
              <Button
                style={{
                  marginTop: '10px',
                }}
                loading={loading}
                disabled={paste === ''}
                onClick={async () => {
                  setLoading(true)
                  const json = await CreateData(
                    'file',
                    new File(
                      [new Blob([paste], { type: 'text/plain' })],
                      'paste.txt',
                      {
                        type: 'text/plain',
                      },
                    ),
                    config,
                  )
                  json.success
                    ? success(
                        'Paste created, URL copied to clipboard',
                        json.data.url as string,
                      )
                    : error(json.data.message as string)
                  setLoading(false)
                }}
              >
                Paste
              </Button>
            </Center>
          </Tabs.Tab>
          <Tabs.Tab label="Shorten" icon={<Link size={14} />}>
            <Group position="apart">
              <TextInput
                variant="default"
                style={{ width: '77%' }}
                placeholder="URL"
                value={url}
                onKeyDown={getHotkeyHandler([
                  [
                    'Enter',
                    async () => {
                      if (!url.match(urlRegex({ exact: true })) || loading)
                        return
                      setLoading(true)
                      const json = await CreateData('url', url, config)
                      json.success
                        ? success(
                            'Shortened URL copied to clipboard',
                            json.data.url as string,
                          )
                        : error(json.data.message as string)
                      setLoading(false)
                    },
                  ],
                ])}
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
                  const json = await CreateData('url', url, config)
                  json.success
                    ? success(
                        'Shortened URL copied to clipboard',
                        json.data.url as string,
                      )
                    : error(json.data.message as string)
                  setLoading(false)
                }}
              >
                Shorten
              </Button>
            </Group>
          </Tabs.Tab>
        </Tabs>
      </MantineModal>

      <Button
        variant="light"
        color="teal"
        fullWidth
        size="lg"
        onClick={() => setOpened(true)}
        style={{ marginTop: 14 }}
      >
        Tools
      </Button>
    </>
  )
}