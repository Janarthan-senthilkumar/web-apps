import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ children, title }) {
    return (
        <div className="main-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title={title} />
                <div className="page-body fade-in">
                    {children}
                </div>
            </div>
        </div>
    );
}
