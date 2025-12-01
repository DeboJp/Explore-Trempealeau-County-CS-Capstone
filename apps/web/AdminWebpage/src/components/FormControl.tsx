interface FormAreaProps {
    children: React.ReactNode;
    style?: React.CSSProperties | undefined;
    disabled?: boolean;
}
const FormControl = (props: FormAreaProps) => {
    return (
        <div style={{...props.style}} className={`form-control ${props.disabled ? 'form-control--disabled' : ''}`}>
            {props.children}
        </div>
    )
}

export default FormControl;