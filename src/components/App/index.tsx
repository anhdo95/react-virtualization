import React from 'react'
import {range} from 'lodash-es'
import Window from '../Window'
import styles from './styles.module.css'

function App() {
  return (
    <div className={styles.app}>
      <Window rowHeight={60}>
        {range(1000).map(number => (
          <li className={styles.row} key={number}>{number}</li>
        ))}
      </Window>
    </div>
  )
}

export default App
