import React from 'react';
import {LuInfo} from 'react-icons/lu';

interface QuoteDetailsProps {
    expectedOutput: number;
    toTokenSymbol: string;
    slippageTolerance?: number;
    minAmountOut?: number;
}

export const QuoteDetails: React.FC<QuoteDetailsProps> = ({
                                                              expectedOutput,
                                                              toTokenSymbol,
                                                              slippageTolerance = 0.5,
                                                              minAmountOut,
                                                          }) => {
    const minimumReceived = minAmountOut ?? (expectedOutput * (1 - slippageTolerance / 100));
    return (
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl p-4
                       mb-4 border border-slate-600/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
                <LuInfo className="text-yellow-400"/>
                <span className="text-sm font-bold text-yellow-400">Swap Details</span>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-400 font-bold">Expected Output:</span>
                    <span className="text-white font-medium">
                        {expectedOutput.toFixed(4)} {toTokenSymbol}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400 font-bold">Minimum Received:</span>
                    <span className="text-white">
                        {minimumReceived.toFixed(4)} {toTokenSymbol}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400 font-bold">Slippage Tolerance:</span>
                    <span className="text-white">{slippageTolerance}%</span>
                </div>
            </div>
        </div>
    );
};