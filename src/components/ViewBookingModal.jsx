const ViewBookingModal = ({ booking, onClose }) => {
  const general = booking.generalInformation;
  const nominee = booking.nomineeInformation;
  const payment = booking.paymentSchedule;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center animate-fadeIn">
      <div className="bg-white w-225 max-h-[90vh] overflow-y-auto rounded-2xl p-6 animate-scaleIn">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Booking Details</h2>

          <button onClick={onClose}>Close</button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Applicant Info</h3>

            <p>Name: {general.fullNameEn}</p>
            <p>Phone: {general.mobile1}</p>
            <p>Email: {general.email}</p>
            <p>NID: {general.nid}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Nominee Info</h3>

            <p>Name: {nominee.name}</p>
            <p>Relation: {nominee.relation}</p>
            <p>Phone: {nominee.mobile1}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Payment</h3>

            <p>Shares: {payment.numberOfShare}</p>
            <p>Total Price: ৳{payment.totalPrice}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBookingModal;
