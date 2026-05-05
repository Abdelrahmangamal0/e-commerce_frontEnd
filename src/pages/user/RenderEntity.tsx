import { OfferDetails, OrderDetails, ProductDetails } from "./NotificationDetails";

type Props = {
    kind: string;
    data: any;
  };
  
  export const RenderEntity = ({ kind, data }: Props) => {
    switch (kind) {
      case "Offer":
       console.log(data);
       
        return <OfferDetails data={data.data.data.coupon} />;
  
      case "Product":
        return <ProductDetails data={data} />;
  
      case "Order":
       console.log(data);
       
        return <OrderDetails data={data.data.data.order} />;
  
      default:
        return <p>Unknown notification type</p>;
    }
  };