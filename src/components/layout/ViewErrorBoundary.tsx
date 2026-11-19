import { WarningCircle } from '@phosphor-icons/react'
import { Component, type ReactNode } from 'react'
import { viewHref } from '../../lib/views'
import { ButtonLink } from '../ui/ButtonLink'
import { EmptyState } from '../ui/EmptyState'
import { ReloadButton } from '../ui/ReloadButton'

interface ViewErrorBoundaryProps {
  children: ReactNode
}

/** Catches a view that fails to load or render and offers a reload or the way back, without guessing at the cause. */
export class ViewErrorBoundary extends Component<ViewErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="container-site py-section">
        <EmptyState
          icon={WarningCircle}
          tone="error"
          title="This view didn't load"
          action={
            <div className="flex flex-wrap gap-3">
              <ReloadButton variant="primary" />
              <ButtonLink href={viewHref('overview')} variant="secondary">
                Back to overview
              </ButtonLink>
            </div>
          }
        >
          Reload to try again, or go back to the overview.
        </EmptyState>
      </div>
    )
  }
}
