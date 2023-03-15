import FixedSizeGrid from '../components/FixedSizeGrid'
import VariableSizeGrid from '../components/VariableSizeGrid'

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

      <section className="section">
        <h3 className="heading">Variable Size Grid</h3>
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
      </section>
    </div>
  )
}

export default Grid
