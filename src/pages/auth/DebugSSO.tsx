export default function DebugSSO() {
    console.log("DebugSSO component loaded!");
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-red-100">
            <div className="text-center p-8 bg-white rounded shadow">
                <h1 className="text-2xl font-bold text-red-600">DEBUG SSO PAGE</h1>
                <p className="mt-4">If you can see this, routing is working!</p>
                <p className="mt-2">Current URL: {window.location.href}</p>
                <p className="mt-2">Time: {new Date().toLocaleString()}</p>
            </div>
        </div>
    );
}