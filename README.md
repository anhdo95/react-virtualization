# react-virtualization


## Fixed Size List
```ts
<FixedSizeList
  className="list"
  itemCount={1000}
  itemSize={45}
  width={300}
  height={200}
>
  {({ index, style }) => (
    <div className="row" style={style}>
      Row {index}
    </div>
  )}
</FixedSizeList>
```

## Fixed Size List - Horizontal Direction
```ts
<FixedSizeList
  className="list"
  direction="horizontal"
  itemCount={1000}
  itemSize={90}
  width={300}
  height={75}
>
  {({ index, style }) => (
    <div className="row" style={style}>
      Column {index}
    </div>
  )}
</FixedSizeList>
```

## Variable Size List
```ts
const getRandomArbitrary = (min: number, max: number) =>
  Math.random() * (max - min) + min


const variableItems = Array(1000)
  .fill(true)
  .map(() => ({
    width: getRandomArbitrary(80, 100),
    height: getRandomArbitrary(40, 60),
  }))

...

<VariableSizeList
  className="list"
  itemCount={variableItems.length}
  itemSize={(index) => variableItems[index].height}
  width={300}
  height={200}
>
  {({ index, style }) => (
    <div className="row" style={style}>
      Row {index}
    </div>
  )}
</VariableSizeList>
```

## Variable Size List
```ts
const variableItems = Array(1000)
  .fill(true)
  .map(() => ({
    width: getRandomArbitrary(80, 100),
    height: getRandomArbitrary(40, 60),
  }))

...

<VariableSizeList
  className="list"
  direction="horizontal"
  itemCount={variableItems.length}
  itemSize={(index) => variableItems[index].width}
  width={300}
  height={75}
  estimatedItemSize={90}
>
  {({ index, style }) => (
    <div className="row" style={style}>
      Column {index}
    </div>
  )}
</VariableSizeList>
```

## Fixed Size Grid
```ts
<FixedSizeGrid
  className="list"
  rowCount={200}
  rowHeight={75}
  columnCount={150}
  columnWidth={85}
  width={300}
  height={200}
>
  {({ columnIndex, rowIndex, style }) => {
    const className =
      rowIndex % 2 === 0
        ? columnIndex % 2 === 0
          ? 'row highlight'
          : 'row'
        : columnIndex % 2 === 0
        ? 'row'
        : 'row highlight'
    return (
      <div className={className} style={style}>
        {rowIndex}:{columnIndex}
      </div>
    )
  }}
</FixedSizeGrid>
```

## Variable Size Grid
```ts
const getRandomArbitrary = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

const rowItems = Array(500)
  .fill(true)
  .map(() => ({
    size: getRandomArbitrary(80, 100),
  }))

const columnItems = Array(1000)
  .fill(true)
  .map(() => ({
    size: getRandomArbitrary(50, 70),
  }))

...

<VariableSizeGrid
  className="list"
  rowCount={rowItems.length}
  rowHeight={(index) => rowItems[index].size}
  columnCount={columnItems.length}
  columnWidth={(index) => columnItems[index].size}
  width={300}
  height={200}
  estimatedRowHeight={90}
  estimatedColumnWidth={60}
>
  {({ rowIndex, columnIndex, style }) => {
    const className =
      rowIndex % 2 === 0
        ? columnIndex % 2 === 0
          ? 'row highlight'
          : 'row'
        : columnIndex % 2 === 0
        ? 'row'
        : 'row highlight'
    return (
      <div className={className} style={style}>
        {rowIndex}:{columnIndex}
      </div>
    )
  }}
</VariableSizeGrid>
```