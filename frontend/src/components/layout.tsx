import * as React from 'react'
import { Helmet } from 'react-helmet'

import { MantineProvider, GlobalStyles, NormalizeCSS } from '@mantine/core'
import { NotificationsProvider } from '@mantine/notifications'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <MantineProvider theme={{ colorScheme: 'dark' }}>
      <GlobalStyles />
      <NormalizeCSS />
      <Helmet>
        <title>Host</title>
        <meta name="theme-color" content="#85144b" />
        <meta name="twitter:title" content="Host" />
        <meta property="og:title" content="Host" />
        <meta
          name="twitter:description"
          content="The fastest and easiest way to host your files and shortened URLs. Open source with no signup, no ads, and no tracking."
        />
        <meta
          property="og:description"
          content="The fastest and easiest way to host your files and shortened URLs. Open source with no signup, no ads, and no tracking."
        />
      </Helmet>
      <NotificationsProvider>{children}</NotificationsProvider>
    </MantineProvider>
  )
}
