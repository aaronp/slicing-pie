
// our application settings, saved to persistent (perhaps local) storage
export type Settings = {

  // grunts in a <name>:<address> format
  grunts : Record<string, string>,

  // funds in a <name>:<address> format
  funds : Record<string, string>,

  // the kind group address
  kindContractAddress : string
}

const defaultSettings = () : Settings => {
  return {
    grunts : {},
    funds : {},
    kindContractAddress : ''
  }
}

export type LabeledAddress = {
    label : string
    address : string
}

export const toLabels = (labels : Record<string, string>) : LabeledAddress[]=> Object.entries(labels).map(([label, address]) => ({ label, address }))
export const toRecord = (labels : LabeledAddress[]) : Record<string, string> => 
  labels.reduce((acc, { label, address }) => {
    acc[label] = address;
    return acc;
  }, {} as Record<string, string>)

// takes a text block and sparates the lines into key:value pairs
export const toMap = (array : LabeledAddress[]) => {
  let map = new Map<string, string>()
  array.forEach(i => {
      map.set(i.address, i.label)
  })
  return map
}
export const toText = (array : Record<string, string>) => Object.entries(array).map(([label, address]) => `${label}:${address}`).join('\n')
export const toTextFromLabels = (array : LabeledAddress[]) => array.map(({ label, address }) => `${label}:${address}`).join('\n')

export const splitMapping = (content : string) : Record<string, string> => {
  let record : Record<string, string> = {}
  content.split('\n')
      .map(line => line.trim())
      .filter(line => line.includes(':'))
      .forEach(line => {
          const [label, address] = line.split(':').map(part => part.trim())
          record[label] = address
      })
      console.log(`splitMapping:\n${content}\n\nreturned\n${JSON.stringify(record, null, 2)}`)
  return record
}


export const splitMappingAsLabels = (content : string) : LabeledAddress[] => {
    return content.split('\n')
        .map(line => line.trim())
        .filter(line => line.includes(':'))
        .map(line => {
            const [label, address] = line.split(':').map(part => part.trim());
            return { label, address }
        })
}

export const addGruntFund = (settings  : Settings, entry : LabeledAddress)  => {
  settings.funds[entry.label] = entry.address
  saveSettings(settings)
}

export const addGrunt = (entry : LabeledAddress, settings  : Settings)  => {
  settings.grunts[entry.label] = entry.address
  saveSettings(settings)
}

  // let address : string = $state('');
export const loadSettings = () : Settings => {
    const str = localStorage.getItem('grunt-settings')
    if (!str) {
        saveSettings(defaultSettings())
        return loadSettings()
    } else {
        return JSON.parse(str) as Settings
    }
}


export const saveSettings = (s : Settings) => {
  const id = (new Date()).toISOString()
  // keep a back-up. TODO - clean up old copies!
  localStorage.setItem(`grunt-settings-${id}`, JSON.stringify(s))
  localStorage.setItem('grunt-settings', JSON.stringify(s))
}
