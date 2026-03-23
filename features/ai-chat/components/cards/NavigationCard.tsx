import * as React from 'react'
import Link from 'next/link'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface NavigationCardProps {
  data: {
    route: string
    label?: string
  }
}

export const NavigationCard: React.FC<NavigationCardProps> = ({ data }) => {
  return (
    <Card data-testid="navigation-card">
      <CardContent>
        <Link href={data.route}>
          <Button>{data.label ?? data.route}</Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default NavigationCard
