import React from 'react'
import { throttle } from 'lodash-es'
import useElementSize from '../../hooks/useElementSize'

import styles from './styles.module.css'

export interface WindowProps {
  rowHeight: number
  children: Array<JSX.Element>
  gap?: number
}

const bufferedItems = 2

const Window: React.FC<WindowProps> = ({ rowHeight, children, gap = 0 }) => {
  const [containerRef, { height: containerHeight }] =
    useElementSize<HTMLUListElement>()
  const [scrollPosition, setScrollPosition] = React.useState(0)

  const visibleChildren = React.useMemo(() => {
    const startIndex = Math.max(
      Math.floor(scrollPosition / rowHeight) - bufferedItems,
      0
    )
    const endIndex = Math.min(
      Math.ceil((scrollPosition + containerHeight) / rowHeight - 1) +
        bufferedItems,
      children.length - 1
    )

    return children.slice(startIndex, endIndex + 1).map((child, index) =>
      React.cloneElement(child, {
        style: {
          position: 'absolute',
          top: (startIndex + index) * rowHeight + index * gap,
          height: rowHeight,
          left: 0,
          right: 0,
          lineHeight: `${rowHeight}px`,
        },
      })
    )
  }, [children, containerHeight, rowHeight, scrollPosition, gap])

  const onScroll = React.useMemo(
    () =>
      throttle(
        function (e: any) {
          setScrollPosition(e.target.scrollTop)
        },
        50,
        { leading: false }
      ),
    []
  )

  return (
    <ul onScroll={onScroll} ref={containerRef} className={styles.container}>
      {visibleChildren}
    </ul>
  )
}

export default Window
