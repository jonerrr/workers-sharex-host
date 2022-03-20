import * as React from 'react'
import { Upload, FileUpload, X, Icon as TablerIcon } from 'tabler-icons-react'
import { Text, Group } from '@mantine/core'
import { DropzoneStatus } from '@mantine/dropzone'

const FileUploadIcon = ({
  status,
  ...props
}: React.ComponentProps<TablerIcon> & { status: DropzoneStatus }) => {
  if (status.accepted) return <Upload {...props} />
  if (status.rejected) return <X {...props} />
  return <FileUpload {...props} />
}

export const dropzoneChildren = (status: DropzoneStatus) => (
  <Group
    position="center"
    spacing="xl"
    style={{ minHeight: 220, pointerEvents: 'none' }}
  >
    <FileUploadIcon status={status} style={{ color: '#C1C2C5' }} size={80} />

    <div>
      <Text size="xl" inline>
        Drag or click to upload files
      </Text>
      <Text size="sm" color="dimmed" inline mt={7}>
        One file at a time, must not exceed 25mb
      </Text>
    </div>
  </Group>
)
