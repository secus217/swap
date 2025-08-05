import React, { useState } from "react";
import { Button, Tooltip, Spin } from "antd";
import { LuArrowUpDown, LuRefreshCcw, LuSettings } from "react-icons/lu";
import SettingsModal from "./SettingsModal"; // Adjust path as needed

interface CardTitleBarProps {
    title: string;
    description?: string;
    loading?: boolean;
    onRefresh?: () => void;
    icon?: React.ReactNode;
    slippageTolerance?: number;
    onSlippageChange?: (value: number) => void;
}

const CardTitleBar: React.FC<CardTitleBarProps> = ({
                                                       title,
                                                       description,
                                                       loading = false,
                                                       onRefresh,
                                                       icon = <LuArrowUpDown className="text-white text-lg sm:text-xl" />,
                                                       slippageTolerance = 0.5,
                                                       onSlippageChange,
                                                   }) => {
    const [settingsModalVisible, setSettingsModalVisible] = useState(false);

    return (
        <>
            <div className="flex justify-between items-center sm:items-center mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500 rounded-xl
                         flex items-center justify-center shadow-lg flex-shrink-0">
                        {icon}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-300
                                     to-blue-300 bg-clip-text text-transparent truncate"
                        >
                            {title}
                        </h2>
                        {description && (
                            <p className="text-xs sm:text-sm text-gray-400 truncate hidden sm:block">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex gap-1 sm:gap-2 flex-shrink-0 ml-2">
                    {/* Settings Button */}
                    {onSlippageChange && (
                        <Tooltip>
                            <Button
                                type="text"
                                shape="circle"
                                size="small"
                                icon={<LuSettings size={14} className="sm:w-4 sm:h-4" />}
                                onClick={() => setSettingsModalVisible(true)}
                                className="bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30
                                         hover:text-white transition-all duration-300 w-8 h-8 sm:w-9 sm:h-9"
                            />
                        </Tooltip>
                    )}

                    {/* Refresh Button */}
                    {onRefresh && (
                        <Tooltip>
                            <Button
                                type="text"
                                shape="circle"
                                size="small"
                                icon={loading ? <Spin size="small" /> : <LuRefreshCcw size={14} className="sm:w-4 sm:h-4" />}
                                onClick={onRefresh}
                                disabled={loading}
                                className="bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30
                                         hover:text-white transition-all duration-300 w-8 h-8 sm:w-9 sm:h-9"
                            />
                        </Tooltip>
                    )}
                </div>
            </div>

            {/* Settings Modal */}
            {onSlippageChange && (
                <SettingsModal
                    open={settingsModalVisible}
                    setOpen={setSettingsModalVisible}
                    slippageTolerance={slippageTolerance}
                    onSlippageChange={onSlippageChange}
                />
            )}
        </>
    );
};

export default CardTitleBar;