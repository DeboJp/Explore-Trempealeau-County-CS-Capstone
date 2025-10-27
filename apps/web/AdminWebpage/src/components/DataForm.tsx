import { useState } from 'react'

const DataForm = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [score, setScore] = useState(50)

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Collect missing fields
    const missingFields: string[] = []

    if (!name.trim()) missingFields.push('Name')
    if (!description.trim()) missingFields.push('Description')
    if (score === null || score === undefined) missingFields.push('Score')

    if (missingFields.length > 0) {
      alert(`Please fill out the following field(s):\n- ${missingFields.join('\n- ')}`)
      return
    }

    // If everything is filled
    alert(`Everything submitted!\n\nName: ${name}\nDescription: ${description}\nScore: ${score}`)

    // Clear fields
    setName('')
    setDescription('')
    setScore(0)
  }

  return (
    <form className="data-form" onSubmit={handleSubmit}>
      <label>
        Trail Name:
        <input 
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter the trail's name"
        />
      </label>

      <label>
        Description:
        <input 
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a description"
          style={{
                height: '80px'
            }}
        />
      </label>

      <label>
        Score: {score}
        <input 
          type="number"
          min="0"
          max="100"
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
        />
      </label>

      <div className="buttons">
        <button type="submit">Submit</button>
        <button type="reset" onClick={() => { setName(''); setDescription(''); setScore(0) }}>
          Reset
        </button>
      </div>
    </form>
  )
}

export default DataForm
