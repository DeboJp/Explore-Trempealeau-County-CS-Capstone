interface FormAreaProps {
    title: string | undefined;
    style: React.CSSProperties | undefined;
    width: '100%' | '75%' | '50%' | undefined;
    children: React.ReactNode;
}
const FormArea = (props: FormAreaProps) => {
    return (
        <fieldset style={{...props.style, border: '2px solid #e0e0e0', borderRadius: '8px'}} className={`form-area form-area--width-${props.width || '100%'}`}>
            {props.title && <legend style={{ padding: '0 0.5rem'}}>{props.title}</legend>}
            <div className="p-1">
                {props.children}
            </div>
        </fieldset>
    )}
export default FormArea;