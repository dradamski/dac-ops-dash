import { BrowserRouter } from 'react-router-dom';
import { FilterProvider } from '../context/FilterContext';
import { Layout } from './Layout';
import { AppRoutes } from './routes';

/**
 * Main App component
 */
function App() {
    return (
        <BrowserRouter>
            <FilterProvider>
                <Layout>
                    <AppRoutes />
                </Layout>
            </FilterProvider>
        </BrowserRouter>
    );
}

export default App;
