import HomePage from '../ui/pages/HomePage';
import './globals.scss';
import ConfigProvider from '../ui/contexts/ConfigCTX/ConfigProvider';

function App() {

  return (
      <ConfigProvider>
        <HomePage />
      </ConfigProvider>
  )
}

export default App
