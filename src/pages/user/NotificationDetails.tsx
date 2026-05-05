import { getOrderStatusLabel } from "@/lib/utils";
import { URL_Base } from "../admin/UsersPage";

export const ProductDetails = ({ data }: any) => {
    return (
      <div className="space-y-3">
        <p className="font-semibold text-lg">{data.name}</p>
        <p>{data.description}</p>
        <p className="text-green-600 font-bold">{data.price} EGP</p>
      </div>
    );
};
  
export const OfferDetails = ({ data }: any) => {
  if (!data) return <p>No offer found</p>;

  return (
    <div className="flex gap-5 items-start">
      
      {/* Image */}
      <img
        src={`${URL_Base}/${data.image}`}
        alt={data.name}
        className="w-32 h-32 object-cover rounded-lg border"
      />

      {/* Info */}
      <div className="flex-1 space-y-2">
        
        <h3 className="text-xl font-bold text-gray-800">
          {data.name}
        </h3>

        <p className="text-sm text-gray-500">
          Coupon Code: <span className="font-medium">{data._id}</span>
        </p>

        <p className="text-lg font-semibold text-green-600">
          {data.discount}% OFF
        </p>

        <p className="text-sm text-gray-600">
          Type: {data.type}
        </p>

        <div className="text-sm text-gray-500">
          <p>
            Start: {new Date(data.startDate).toLocaleDateString()}
          </p>
          <p>
            End: {new Date(data.endDate).toLocaleDateString()}
          </p>
        </div>

        {/* Status */}
        <div>
          { (new Date(data.startDate) > new Date()) ? (
            <span className="px-2 py-1 text-xs bg-green-100 text-yellow-700 rounded">
              upComing
            </span>
          ) : (new Date(data.endDate) > new Date()) ? (
            <span className="px-2 py-1 text-xs bg-green-100 text-yellow-700 rounded">
              active
              </span>)
              : (
            <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
              Expired
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const OrderDetails = ({ data }: any) => {
  console.log(data);
  
  return (
    <div className="space-y-4">

      {/* Order Header */}
      <div>
        <p className="font-semibold text-lg">
          Order #{data._id }
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Placed on : {new Date(data.createdAt).toDateString()}
        </p>
      </div>

      {/* Status + Total */}
      <div className="flex justify-between items-center">
        <p className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
          {getOrderStatusLabel(data.status)}
        </p>

        <p className="font-bold text-green-600">
          ${data.total}
        </p>
      </div>

      {/* Products */}
      <div>
        <p className="font-semibold mb-2">Products:</p>

        <div className="space-y-2">
          {data.products?.map((item: any, i: number) => (
            <div key={i} className="flex justify-between text-sm">

              <p>
                {item.product?.name} x {item.quantity}
              </p>

              <p className="font-medium">
                ${item.finalPrice}
              </p>

            </div>
          ))}
        </div>
      </div>

      {/* Address */}
<div>
  <p className="font-semibold">Address:</p>

  <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
    <p><span className="font-medium">Region:</span> {data.address.region}</p>
    <p><span className="font-medium">City:</span> {data.address.city}</p>
    <p><span className="font-medium">National:</span> {data.address.nationalAddress}</p>
  </div>
</div>

      {/* Phone */}
      <div>
        <p className="font-semibold">Phone:</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {data.phone}
        </p>
      </div>

      {/* Payment */}
      <div>
        <p className="font-semibold">Payment:</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {data.payment}
        </p>
      </div>

    </div>
  );
};