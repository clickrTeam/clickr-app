const Sandbox = () => {
  return (
    <div className="min-h-screen pt-20 px-4 py-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8">Sandbox</h1>
        
        <div className="w-full max-w-4xl mx-auto">
          <div>
            <div className="flex gap-4 mb-4">
              <div
                className="w-full h-96 bg-gradient-to-br from-clickr-blue to-indigo-600 rounded-3xl"
                style={{
                  clipPath: "polygon(100% 40%, 0% 100%, 0% 0%, 100% 0%)",                
                }}
              />
              <div
                className="w-full h-96 bg-gradient-to-br from-clickr-blue to-indigo-600 rounded-3xl"
                style={{
                  clipPath: "polygon(0 40%, 100% 100%, 100% 0%, 0% 0%)",
                }}
              />
            </div>
            <div className="flex gap-4 mb-4">
              <div
                className="w-full h-96 bg-gradient-to-br from-clickr-blue to-indigo-600 rounded-3xl"
                style={{
                  clipPath: "polygon(100% 0%, 0% 50%, 100% 100%)",          
                }}
              />
              {/* Triangle pointing down in top row gap */}
              <div
                className="w-full h-96 bg-gradient-to-br from-clickr-blue to-indigo-600 rounded-3xl"
                style={{
                  clipPath: "polygon(0% 0%, 100% 50%, 0% 100%)",
                }}
              />
            </div>
            <div className="flex gap-4">
              <div
                className="w-full h-96 bg-gradient-to-br from-clickr-blue to-indigo-600 rounded-3xl"
                style={{
                  clipPath: "polygon(100% 60%, 0% 0, 0% 100%, 100% 100%)",                
                }}
              />
              <div
                className="w-full h-96 bg-gradient-to-br from-clickr-blue to-indigo-600 rounded-3xl"
                style={{
                  clipPath: "polygon(0 60%, 100% 0, 100% 100%, 0% 100%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sandbox;

