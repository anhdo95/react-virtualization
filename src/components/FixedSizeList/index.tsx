import React, { createElement, SyntheticEvent, FunctionComponent, CSSProperties } from 'react'

type RenderComponentProps = {
  index: number
  style: CSSProperties
}

type ScrollDirection = 'Vertical' | 'Horizontal'

export type FixedSizeListProps = {
  children: FunctionComponent<RenderComponentProps>
  className?: string
  style?: CSSProperties
  direction?: ScrollDirection
  itemSize: number
  itemCount: number
  width: number
  height: number
}

const overscanCount = 2

const FixedSizeList: React.FC<FixedSizeListProps> = ({
  children,
  className,
  style,
  direction = 'Vertical',
  itemSize,
  itemCount,
  width,
  height,
}) => {
  const [scrollOffset, setScrollOffset] = React.useState(0)

  const getRangeToRender = () => {
    const size = direction === 'Horizontal' ? width : height
    const startIndex = Math.max(
      0,
      Math.min(itemCount - 1, Math.floor(scrollOffset / itemSize))
    )
    const endIndex = Math.min(
      itemCount - 1,
      Math.max(
        0,
        startIndex +
          Math.floor(size + scrollOffset - startIndex * itemSize) / itemSize
      )
    )
    const startIndexBackward = Math.max(0, startIndex - overscanCount)
    const endIndexForward = Math.min(itemCount - 1, endIndex + overscanCount)
    return [startIndexBackward, endIndexForward, startIndex, endIndex]
  }

  const getItemStyle = (index: number) => {
    const startOffset = index * itemSize
    const style: CSSProperties = {
      position: 'absolute',
      top: direction === 'Horizontal' ? 0 : startOffset,
      left: direction === 'Horizontal' ? startOffset : 0,
      width: direction === 'Horizontal' ? itemSize : '100%',
      height: direction === 'Horizontal' ? '100%' : itemSize,
    }
    return style
  }

  const handleScroll = (e: SyntheticEvent<HTMLDivElement>) => {
    const { scrollTop, scrollLeft } =  e.currentTarget
    setScrollOffset(direction === 'Horizontal' ? scrollLeft : scrollTop)
  }

  const [startIndex, endIndex] = getRangeToRender()
  const items = []

  if (itemCount > 0) {
    for (let index = startIndex; index <= endIndex; index++) {
      items.push(
        createElement(children, {
          key: index,
          index,
          style: getItemStyle(index),
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
        willChange: 'transform',
        ...style,
      },
    },
    createElement('div', {
      children: items,
      style: {
        overflow: 'hidden',
        width: direction === 'Horizontal' ? estimatedTotalSize : '100%',
        height: direction === 'Horizontal' ? '100%' : estimatedTotalSize,
      },
    })
  )
}

export default FixedSizeList
