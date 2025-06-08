interface ListItemProps {
  text: string;
}

const ListItem: React.FC<ListItemProps> = ({ text }) => {
  return <div className="bg-white rounded-2xl p-2 text-sm font-normal">{text}</div>;
};

export default ListItem;
