import { Result } from "../interface"

interface ICard {
  url: string | undefined
  onClick: React.MouseEventHandler<HTMLAnchorElement>
}

export const Card = ({ url, onClick }: ICard) => {
  return (
      <a href="#" onClick={onClick}>
          <img src={url} alt={'photo'} loading="lazy" width={250}  />
      </a>
  )
}