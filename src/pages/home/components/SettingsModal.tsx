import React, { useState, useEffect } from "react";
import { Button, Slider } from "antd";
import {AppModal} from "../../../components";

interface SettingsModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    slippageTolerance: number;
    onSlippageChange: (value: number) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
                                                         open,
                                                         setOpen,
                                                         slippageTolerance,
                                                         onSlippageChange,
                                                     }) => {
    const [tempSlippage, setTempSlippage] = useState(slippageTolerance);

    useEffect(() => {
        setTempSlippage(slippageTolerance);
    }, [slippageTolerance, open]);

    const handleSave = () => {
        onSlippageChange(tempSlippage);
        setOpen(false);
    };

    const handleCancel = () => {
        setTempSlippage(slippageTolerance);
        setOpen(false);
    };

    const slippageMarks = {
        0: '0%',
        0.1: '0.1%',
        0.25: '0.25%',
        0.5: '0.5%',
        0.75: '0.75%',
        1: '1%'
    };

    return (
        <AppModal
            open={open}
            setOpen={setOpen}
            title="Settings"
            width={500}
        >
            <div className="p-3 sm:p-4">
                <div className="mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                        <h3 className="text-base sm:text-lg font-semibold text-white">
                            Slippage Tolerance
                        </h3>
                        <div className="bg-purple-500/20 px-3 py-1 rounded-lg border border-purple-500/30 self-start sm:self-auto">
                            <span className="text-purple-300 font-medium text-sm sm:text-base">
                                {tempSlippage}%
                            </span>
                        </div>
                    </div>

                    <p className="text-gray-400 text-xs sm:text-sm mb-4 leading-relaxed">
                        Your transaction will revert if the price changes unfavorably by more than this percentage.
                    </p>

                    <div className="px-1 sm:px-2">
                        <Slider
                            min={0}
                            max={1}
                            step={0.01}
                            value={tempSlippage}
                            onChange={setTempSlippage}
                            marks={slippageMarks}
                            tooltip={{
                                formatter: (value) => `${value}%`,
                            }}
                        />
                    </div>

                    {/* Quick Select Buttons */}
                    <div className="mt-4 sm:mt-6">
                        <div className="hidden sm:flex gap-2 items-center">
                            <span className="text-sm text-gray-400 mr-2">Quick select:</span>
                            {[0.1, 0.25, 0.5, 0.75, 1].map((value) => (
                                <Button
                                    key={value}
                                    size="small"
                                    type={tempSlippage === value ? "primary" : "default"}
                                    onClick={() => setTempSlippage(value)}
                                    className={
                                        tempSlippage === value
                                            ? "btn-slippage-active"
                                            : "btn-slippage-inactive"
                                    }
                                >
                                    {value}%
                                </Button>
                            ))}
                        </div>

                        {/* Mobile layout for quick select */}
                        <div className="sm:hidden">
                            <p className="text-xs text-gray-400 mb-2">Quick select:</p>
                            <div className="grid grid-cols-3 gap-2">
                                {[0.1, 0.25, 0.5, 0.75, 1].map((value) => (
                                    <Button
                                        key={value}
                                        size="small"
                                        type={tempSlippage === value ? "primary" : "default"}
                                        onClick={() => setTempSlippage(value)}
                                        className={
                                            tempSlippage === value
                                                ? "btn-slippage-active"
                                                : "btn-slippage-inactive"
                                        }
                                    >
                                        {value}%
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Warning for high slippage */}
                    {tempSlippage >= 0.75 && (
                        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                            <p className="text-yellow-400 text-xs sm:text-sm flex items-start gap-1">
                                <span className="text-sm">⚠️</span>
                                <span>High slippage tolerance may result in unfavorable trades.</span>
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                    <Button
                        onClick={handleCancel}
                        className="cancel-button sm:order-1"
                        block
                        size="middle"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleSave}
                        className="btn-purple order-1 sm:order-2"
                        block
                        size="middle"
                    >
                        Save Settings
                    </Button>
                </div>
            </div>
        </AppModal>
    );
};

export default SettingsModal;