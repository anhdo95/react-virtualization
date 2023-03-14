import FixedSizeGrid from '../components/FixedSizeGrid'

const getRandomArbitrary = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

const variableItems = Array(1000)
  .fill(true)
  .map(() => ({
    width: getRandomArbitrary(80, 100),
    height: getRandomArbitrary(40, 60),
  }))

function Grid() {
  return (
    <div>
      <section className="section">
        <h3 className="heading">Fixed Size Grid</h3>
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
      </section>

      {/* <section className="section">
        <h3 className="heading">Variable Size Grid</h3>
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
      </section> */}

      {/* <section className="section">
        <h3 className="heading">Variable Size Grid - Horizontal Direction</h3>
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
      </section> */}
    </div>
  )
}

export default Grid
