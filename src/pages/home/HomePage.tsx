import React, {useState} from "react";
import SwapCard from "./SwapCard";
import AddLiquidityCard from "./AddLiquidityCard.tsx";
import {TbLink} from "react-icons/tb";
import {LuArrowUpDown} from "react-icons/lu";

type TabValue = "swap" | "liquidity";

const tabs: { label: string; value: TabValue }[] = [
    {label: "Swap", value: "swap"},
    {label: "Add liquidity", value: "liquidity"},
];

const HomePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabValue>("swap");

    return (
        <div
            className="w-full max-w-xl mx-auto px-3 sm:px-4 mt-16 sm:mt-10 lg:mt-14 rounded-xl sm:rounded-2xl text-white space-y-4 sm:space-y-6">
            {/* Tabs */}
            <div
                className="w-full max-w-xl mx-auto flex items-center justify-between bg-gradient-to-br
                 from-slate-900 via-purple-900 to-slate-900 rounded-xl sm:rounded-2xl px-3 sm:px-4
                  lg:px-6 py-3 sm:py-4 gap-1 sm:gap-2">
                {tabs.map((tab, index) => (
                    <div key={index} className={`flex w-full justify-center items-center gap-2 text-sm sm:text-base py-2 px-2 sm:px-3 rounded-xl 
                        sm:rounded-2xl font-bold transition-all duration-200 cursor-pointer ${
                        activeTab === tab.value
                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-slate-900"
                            : "hover:from-purple-600 hover:to-blue-600 transition-all duration-300" +
                            " transform hover:scale-105 shadow-lg text-purple-300"
                         }`}
                         onClick={() => setActiveTab(tab.value)}
                    >
                        {tab.value == "swap" ? (<span><LuArrowUpDown/></span>) : (<span><TbLink/></span>)}
                        <button
                            key={tab.value}
                            className="cursor-pointer"
                        >
                            {tab.label}
                        </button>
                    </div>

                ))}
            </div>

            {/* Tab Content */}
            {activeTab === "swap" && <SwapCard/>}
            {activeTab === "liquidity" && <AddLiquidityCard/>}
        </div>
    );
};

export default HomePage;
