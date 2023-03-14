import { BrowserRouter, Switch, Route } from 'react-router-dom'
import Layout from './Layout'
import List from './pages/List'
import Grid from './pages/Grid'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          <Route exact path="/" component={List} />
          <Route path="/list" component={List} />
          <Route path="/grid" component={Grid} />
          <Route path="*" component={() => <div />} />
        </Switch>
      </Layout>
    </BrowserRouter>
  )
}

export default App
