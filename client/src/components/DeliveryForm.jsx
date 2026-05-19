import { useEffect, useState } from "react";

import { getTools } from "../services/toolService";

import DeliveryChallan from "./DeliveryChallan";
import { INDIAN_STATES } from "../constants/states";


const DeliveryForm = () => {

  const [tools, setTools] = useState([]);

  const [showInvoice, setShowInvoice] =
    useState(false);

  // 🔥 CLIENT DETAILS
  const [formData, setFormData] =
    useState({

      dc_number: "",

      client_name: "",

      address: "",

      attention_person: "",

      phone: "",

      po_number: "",

      po_date: "",

      state: "",

      returnable: true
    });

  // 🔥 ITEM ROWS
  const [items, setItems] = useState([
    {
      tool_id: "",
      quantity: 1,
      unitPrice: 0,
      price: 0
    }
  ]);



  // 🔥 FETCH TOOLS
  useEffect(() => {

    fetchTools();
    fetchDCNumber();

  }, []);

  const fetchDCNumber = async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/dc-number`);
      const data = await res.json();
      if (data.dcNumber) {
        setFormData((prev) => ({ ...prev, dc_number: data.dcNumber }));
      }
    } catch (err) {
      console.error("Error fetching DC number:", err);
    }
  };

  const fetchTools = async () => {

    try {

      const data = await getTools();

      setTools(data);

    } catch (err) {

      console.error(err);

    }
  };

  // 🔥 HANDLE FORM
  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value

    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    // 🔥 AUTO-MULTIPLY PRICE
    if (field === "quantity") {
      const unitPrice = Number(updatedItems[index].unitPrice) || 0;
      updatedItems[index].price = unitPrice * Number(value);
    }
    
    if (field === "price") {
      const qty = Number(updatedItems[index].quantity) || 1;
      updatedItems[index].unitPrice = Number(value) / qty;
    }

    setItems(updatedItems);
  };



  // 🔥 ADD ITEM
  const addRow = () => {

    setItems([
      ...items,
      {
        tool_id: "",
        quantity: 1,
        unitPrice: 0,
        price: 0
      }
    ]);


  };

  // 🔥 REMOVE ITEM
  const removeRow = (index) => {

    const updatedItems =
      items.filter(
        (_, i) => i !== index
      );

    setItems(updatedItems);
  };

  // 🔥 SUBMIT
  const handleSubmit = () => {

    // VALIDATION

    if (
      !formData.client_name
    ) {

      alert(
        "Please enter client name"
      );

      return;
    }

    if (
      !formData.address
    ) {

      alert(
        "Please enter address"
      );

      return;
    }

    const invalidItem =
      items.find(
        (item) =>
          !item.tool_id ||
          item.quantity <= 0
      );

    if (invalidItem) {

      alert(
        "Please select tool and quantity"
      );

      return;
    }

    setShowInvoice(true);
  };

  // 🔥 PRINT
  const handlePrint = () => {

    const printContent =
      document.getElementById(
        "challan-print"
      ).outerHTML;

    const printWindow =
      window.open(
        "",
        "",
        "width=1000,height=900"
      );

    printWindow.document.write(`

      <html>

        <head>

          <title>
            Delivery Challan
          </title>

          <style>

            body {
              font-family: Arial;
              padding: 10px;
            }

            @page {
              size: A4;
              margin: 5mm;
            }

          </style>

        </head>

        <body>

          ${printContent}

        </body>

      </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    printWindow.print();
  };

  return (

    <div style={{ padding: "20px" }}>

      <h2>
        Delivery Challan Form
      </h2>

      {/* 🔥 CLIENT DETAILS */}

      <div
        style={{
          border: "1px solid #ccc",
          padding: "15px",
          marginBottom: "20px"
        }}
      >

        <h3>
          Client Details
        </h3>

        <input
          type="text"
          name="dc_number"
          placeholder="Generating DC Number..."
          value={
            formData.dc_number
          }
          readOnly
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
            backgroundColor: "#e9ecef",
            cursor: "not-allowed",
            fontWeight: "bold",
            color: "#495057",
            boxSizing: "border-box"
          }}
        />

        <input
          type="text"
          name="client_name"
          placeholder="Client Name"
          value={
            formData.client_name
          }
          onChange={
            handleChange
          }
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px"
          }}
        />

        <textarea
          name="address"
          placeholder="Address"
          rows="4"
          value={
            formData.address
          }
          onChange={
            handleChange
          }
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px"
          }}
        />

        <input
          type="text"
          name="attention_person"
          placeholder="Attention Person"
          value={
            formData.attention_person
          }
          onChange={
            handleChange
          }
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px"
          }}
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={
            formData.phone
          }
          onChange={
            handleChange
          }
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px"
          }}
        />

        <input
          type="text"
          name="po_number"
          placeholder="PO Number"
          value={
            formData.po_number
          }
          onChange={
            handleChange
          }
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px"
          }}
        />

        <input
          type="date"
          name="po_date"
          value={
            formData.po_date
          }
          onChange={
            handleChange
          }
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px"
          }}
        />

        <select
          name="state"
          value={formData.state}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            background: "white"
          }}
        >
          <option value="">-- Select State --</option>
          {INDIAN_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        <label>

          <input
            type="checkbox"
            checked={
              formData.returnable
            }
            onChange={() =>
              setFormData({
                ...formData,
                returnable:
                  !formData.returnable
              })
            }
          />

          {" "}
          Returnable

        </label>
      </div>

      {/* 🔥 ITEMS */}

      <div
        style={{
          border: "1px solid #ccc",
          padding: "15px"
        }}
      >

        <h3>Items</h3>

        {items.map(
          (item, index) => (

            <div
              key={index}
              style={{
                marginBottom:
                  "15px"
              }}
            >

              <select
                value={
                  item.tool_id
                }
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "tool_id",
                    e.target.value
                  )
                }
                style={{
                  padding: "8px"
                }}
              >

                <option value="">
                  Select Tool
                </option>

                {tools.map(
                  (tool) => (

                    <option
                      key={tool.id}
                      value={tool.id}
                    >
                      {
                        tool.tool_name
                      }
                    </option>
                  )
                )}

              </select>

              <input
                type="number"
                min="1"
                value={
                  item.quantity
                }
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "quantity",
                    e.target.value
                  )
                }
                style={{
                  width: "80px",
                  marginLeft:
                    "10px",
                  padding: "8px"
                }}
              />

              <input
                type="number"
                placeholder="Price"
                value={
                  item.price
                }
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "price",
                    e.target.value
                  )
                }
                style={{
                  width: "100px",
                  marginLeft:
                    "10px",
                  padding: "8px"
                }}
              />


              <button
                onClick={() =>
                  removeRow(index)
                }
                style={{
                  marginLeft:
                    "10px"
                }}
              >
                Remove
              </button>

            </div>
          )
        )}

        <button
          onClick={addRow}
        >
          Add Item
        </button>

      </div>

      <br />

      {/* 🔥 GENERATE */}

      <button
        onClick={handleSubmit}
        style={{
          backgroundColor:
            "green",
          color: "white",
          padding:
            "10px 20px",
          border: "none",
          cursor: "pointer"
        }}
      >
        Generate Invoice
      </button>

      {/* 🔥 PRINT */}

      {
        showInvoice && (

          <button
            onClick={
              handlePrint
            }
            style={{
              marginLeft:
                "10px",
              backgroundColor:
                "blue",
              color: "white",
              padding:
                "10px 20px",
              border: "none",
              cursor: "pointer"
            }}
          >
            Print
          </button>
        )
      }

      <br />
      <br />

      {/* 🔥 DELIVERY CHALLAN */}

      {
        showInvoice && (

          <DeliveryChallan

            dcNumber={
              formData.dc_number
            }

            clientName={
              formData.client_name
            }

            clientAddress={
              formData.address
            }

            attentionPerson={
              formData.attention_person
            }

            phone={
              formData.phone
            }

            poNumber={
              formData.po_number
            }

            poDate={
              formData.po_date
            }

            stateName={
              formData.state
            }

            returnable={
              formData.returnable
            }

            items={items}

            tools={tools}

          />
        )
      }

    </div>
  );
};

export default DeliveryForm;