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