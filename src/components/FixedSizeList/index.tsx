import React, { createElement, SyntheticEvent, FunctionComponent, CSSProperties } from 'react'

type RenderComponentProps = {
  index: number
  style: CSSProperties
}

export type FixedSizeListProps = {
  children: FunctionComponent<RenderComponentProps>
  className?: string
  style?: CSSProperties
  itemSize: number
  itemCount: number
  width: number
  height: number
}

const overscanCount = 2

const FixedSizeList: React.FC<FixedSizeListProps> = ({
  itemSize,
  itemCount,
  width,
  height,
  className,
  style,
  children,
}) => {
  const [scrollOffset, setScrollOffset] = React.useState(0)

  const getRangeToRender = () => {
    const startIndex = Math.max(
      0,
      Math.min(itemCount - 1, Math.floor(scrollOffset / itemSize))
    )
    const endIndex = Math.min(
      itemCount - 1,
      Math.max(
        0,
        startIndex +
          Math.floor(height + scrollOffset - startIndex * itemSize) / itemSize
      )
    )
    const startIndexBackward = Math.max(0, startIndex - overscanCount)
    const endIndexForward = Math.min(itemCount - 1, endIndex + overscanCount)
    return [startIndexBackward, endIndexForward, startIndex, endIndex]
  }

  const handleScroll = (e: SyntheticEvent<HTMLDivElement>) => {
    setScrollOffset(e.currentTarget.scrollTop)
  }

  const [startIndex, endIndex] = getRangeToRender()
  const items = []

  if (itemCount > 0) {
    for (let i = startIndex; i <= endIndex; i++) {
      items.push(
        createElement(children, {
          key: i,
          index: i,
          style: {
            position: 'absolute',
            top: i * itemSize,
            width: '100%',
            height: itemSize,
          },
        })
      )
    }
  }

  const estimatedTotalSize = itemCount * itemSize

  return createElement(
    'div',
    {
      onScroll: handleScroll,
      className,
      style: {
        position: 'relative',
        overflow: 'auto',
        width,
        height,
        WebkitOverflowScrolling: 'touch',
        willChange: 'transform',
        ...style,
      },
    },
    createElement('div', {
      children: items,
      style: {
        overflow: 'hidden',
        height: estimatedTotalSize,
      },
    })
  )
}

export default FixedSizeList
