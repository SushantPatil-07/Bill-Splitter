import React, { useState } from "react";
import './App.css';
import * as XLSX from "xlsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import { saveAs } from "file-saver";

const BillSplitter = () => {
  const [people, setPeople] = useState([]);
  const [items, setItems] = useState([]);
  const [contributions, setContributions] = useState({});

  const addPerson = (name) => {
    if (name && !people.includes(name)) {
      setPeople([...people, name]);
    }
  };

  const addItem = (itemName) => {
    if (itemName && !items.some((item) => item === itemName)) {
      setItems([...items, itemName]);
    }
  };

  const setContribution = (itemName, person, amount) => {
    setContributions((prev) => ({
      ...prev,
      [itemName]: {
        ...prev[itemName],
        [person]: parseFloat(amount) || 0,
      },
    }));
  };

  const calculateItemTotal = (itemName) => {
    return people.reduce(
      (total, person) => total + (contributions[itemName]?.[person] || 0),
      0
    );
  };

  const calculatePersonTotal = (person) => {
    return items.reduce(
      (total, itemName) => total + (contributions[itemName]?.[person] || 0),
      0
    );
  };

  const calculateGrandTotal = () => {
    return items.reduce(
      (grandTotal, itemName) => grandTotal + calculateItemTotal(itemName),
      0
    );
  };

  const exportToExcel = () => {
    const tableData = [
      ["Item", ...people, "Total"],
      ...items.map((itemName) => [
        itemName,
        ...people.map((person) => contributions[itemName]?.[person] || "-"),
        calculateItemTotal(itemName),
      ]),
      [
        "Grand Total",
        ...people.map((person) => calculatePersonTotal(person)),
        calculateGrandTotal(),
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bill Summary");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, "BillSummary.xlsx");
  };

  return (
    <div className="container mt-5 p-3">
      <h1 className="text-center mb-4">Bill Splitter</h1>

      <div className="mb-3">
        <div className="d-flex flex-column flex-md-row">
          <input
            type="text"
            id="personName"
            placeholder="Enter person's name"
            className="form-control mb-2 mb-md-0 me-md-2"
          />
          <button
            className="btn btn-primary"
            onClick={() =>
              addPerson(document.getElementById("personName").value)
            }
          >
            Add Person
          </button>
        </div>
      </div>

      <div className="mb-3">
        <div className="d-flex flex-column flex-md-row">
          <input
            type="text"
            id="itemName"
            placeholder="Enter item name"
            className="form-control mb-2 mb-md-0 me-md-2"
          />
          <button
            className="btn btn-success"
            onClick={() =>
              addItem(document.getElementById("itemName").value)
            }
          >
            Add Item
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="row">
          <div className="col-12 col-md-4 mb-2">
            <select id="itemSelect" className="form-select">
              {items.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-4 mb-2">
            <select id="personSelect" className="form-select">
              {people.map((person) => (
                <option key={person} value={person}>
                  {person}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-4 mb-2">
            <input
              type="number"
              id="contributionAmount"
              placeholder="Enter amount"
              className="form-control"
            />
          </div>
        </div>
        <button
          className="btn btn-warning mt-2"
          onClick={() =>
            setContribution(
              document.getElementById("itemSelect").value,
              document.getElementById("personSelect").value,
              document.getElementById("contributionAmount").value
            )
          }
        >
          Add Contribution
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped text-center">
          <thead className="table-dark">
            <tr>
              <th>Item</th>
              {people.map((person) => (
                <th key={person}>{person}</th>
              ))}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((itemName) => (
              <tr key={itemName}>
                <td>{itemName}</td>
                {people.map((person) => (
                  <td key={person}>
                    {contributions[itemName]?.[person] ?? "-"}
                  </td>
                ))}
                <td>{calculateItemTotal(itemName)}</td>
              </tr>
            ))}
            <tr className="table-primary">
              <td>Grand Total</td>
              {people.map((person) => (
                <td key={person}>{calculatePersonTotal(person)}</td>
              ))}
              <td>{calculateGrandTotal()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button className="btn btn-info" onClick={exportToExcel}>
        Export to Excel
      </button>
    </div>
  );
};

export default BillSplitter;
