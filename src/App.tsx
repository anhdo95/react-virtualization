import FixedSizeList from './components/FixedSizeList'

import './App.css'

function App() {
  return (
    <div className="app">
      <section className="section">
        <h3 className="heading">Fixed Size List</h3>
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
    </div>
  )
}

export default App
