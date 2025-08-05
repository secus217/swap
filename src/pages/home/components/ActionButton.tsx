import React from 'react';
import {Button} from 'antd';

interface ActionButtonProps {
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    loadingText?: string;
    icon?: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
                                                              onClick,
                                                              loading = false,
                                                              disabled = false,
                                                              children,
                                                              loadingText,
                                                              icon
                                                          }) => {
    return (
        <Button
            type="primary"
            size="large"
            block
            onClick={onClick}
            loading={loading}
            disabled={disabled}
            className={`swap-button ${loading ? 'loading' : ''} 
                       h-12 sm:h-14 lg:h-16 text-base sm:text-lg
                       lg:text-xl font-semibold mt-4 sm:mt-6`
            }
        >
            {loading ? (
                <div className="flex items-center justify-center gap-2">
                    <span className="text-sm sm:text-base lg:text-lg">
                        {loadingText || 'Processing...'}
                    </span>
                </div>
            ) : (
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {icon && (
                        <span className="flex items-center text-lg sm:text-xl lg:text-2xl">
                            {icon}
                        </span>
                    )}
                    <span className="text-sm sm:text-base lg:text-lg font-bold">
                        {children}
                    </span>
                </div>
            )}
        </Button>
    );
};