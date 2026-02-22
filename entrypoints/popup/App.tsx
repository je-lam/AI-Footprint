import { useState } from "react";
// import reactLogo from "@/assets/react.svg";
// import wxtLogo from "/wxt.svg";
import "./App.css";
import ImpactCarousel from "@/components/ImpactCarousel";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1 className="text-5xl font-bold text-red-500">WXT + React</h1>
      <ImpactCarousel />
      <button onClick={() => setCount((count) => count + 1)}>
        Carbon emissions: {count}
      </button>
      <p>
        Edit <code>src/App.tsx</code> and save to test HMR
      </p>
    </>
  );
}

export default App;
