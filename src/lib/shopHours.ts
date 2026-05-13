export function getShopStatus(hours:any[]) {

  if(!hours || hours.length === 0){
    return null
  }

  const now = new Date()

  const day = now.getDay()

  const current = hours.find(
    (h)=>h.dayOfWeek === day
  )

  if(!current){
    return null
  }

  if(current.isClosed){
    return {
      open:false
    }
  }

  const timeNow =
    now.getHours() * 60 +
    now.getMinutes()

  const open =
    parseInt(current.openTime.split(":")[0]) * 60 +
    parseInt(current.openTime.split(":")[1])

  const close =
    parseInt(current.closeTime.split(":")[0]) * 60 +
    parseInt(current.closeTime.split(":")[1])

  if(timeNow >= open && timeNow < close){

    return {
      open:true,
      closeTime: current.closeTime
    }

  }

  return {
    open:false,
    openTime: current.openTime
  }

}