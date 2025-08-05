import {Modal} from "antd";
import React from "react";

const AppModal: React.FC<{
    open: boolean;
    setOpen: (open: boolean) => void;
    title: string;
    children: React.ReactNode;
    width?: number;
    closable?: boolean;
}> = ({title, open, setOpen, children, width, closable = true}) => {
    return (
        <Modal
            title={title}
            open={open}
            onOk={() => setOpen(false)}
            onCancel={() => setOpen(false)}
            footer={[]}
            width={width}
            closable
            closeIcon={closable}
            wrapClassName="custom-dark-modal"
        >
            <div className='text-white'>
                {children}
            </div>
        </Modal>
    )
}
export default AppModal;