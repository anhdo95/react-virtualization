import FixedSizeList from '../components/FixedSizeList'
import VariableSizeList from '../components/VariableSizeList'

const getRandomArbitrary = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

const variableItems = Array(1000)
  .fill(true)
  .map(() => ({
    width: getRandomArbitrary(80, 100),
    height: getRandomArbitrary(40, 60),
  }))

function List() {
  return (
    <div>
      <section className="section">
        <h3 className="heading">Fixed Size List</h3>
        <FixedSizeList className="list" itemCount={1000} itemSize={45} width={300} height={200}>
          {({ index, style }) => (
            <div className="row" style={style}>
              Row {index}
            </div>
          )}
        </FixedSizeList>
      </section>

      <section className="section">
        <h3 className="heading">Fixed Size List - Horizontal Direction</h3>
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
      </section>

      <section className="section">
        <h3 className="heading">Variable Size List</h3>
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
      </section>

      <section className="section">
        <h3 className="heading">Variable Size List - Horizontal Direction</h3>
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
      </section>
    </div>
  )
}

export default List
