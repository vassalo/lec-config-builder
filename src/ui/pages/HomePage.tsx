import { Layout, Row } from 'antd';
import AppHeader from '../components/Header';
import EditEnvironmentSection from '../components/EditEnvironmentSection';
import SetupEnvironmentSection from '../components/SetupEnvironmentSection';
import './HomePage.scss';

function HomePage() {
    return (
        <Layout className='container'>
            <AppHeader/>
            <Row>
                <SetupEnvironmentSection />
                <EditEnvironmentSection />
            </Row>
        </Layout>
    );
}

export default HomePage;
