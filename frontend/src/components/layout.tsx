import * as React from 'react'
import {
  MantineProvider,
  ColorSchemeProvider,
  ColorScheme,
  GlobalStyles,
  NormalizeCSS,
} from '@mantine/core'
import { NotificationsProvider } from '@mantine/notifications'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <MantineProvider theme={{ colorScheme: 'dark' }}>
      <GlobalStyles />
      <NormalizeCSS />
      <NotificationsProvider>{children}</NotificationsProvider>
    </MantineProvider>
  )
}
