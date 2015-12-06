import java.io.BufferedReader;
import java.io.FileReader;
import java.io.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.sql.*;

public class format_data{
  public static void main (String[] args) throws Exception{
    ArrayList<String> master = new ArrayList<String>();
    ArrayList<String> pumas = new ArrayList<String>();
    master.add("YEAR");
    master.add("SERIALNO");
    master.add("PUMA");
    master.add("ADJHSG");
    master.add("ADJINC");
    master.add("FS");
    master.add("RNTP");
    master.add("VACS");
    master.add("VALP");
    master.add("YBL");
    master.add("FINCP");
    master.add("HHL");
    master.add("HINCP");
    master.add("MV");
    master.add("TAXP");
    master.add("WORKSTAT");
    pumas.add("812");
    pumas.add("813");
    pumas.add("814");
    pumas.add("815");
    pumas.add("816");
    pumas.add("4102");
    pumas.add("4103");
    pumas.add("4104");
    pumas.add("4105");
    pumas.add("4106");
    pumas.add("902");
    pumas.add("903");
    pumas.add("904");
    pumas.add("905");

    String sDriverName = "org.sqlite.JDBC";
    Class.forName(sDriverName);
    String sTempDb = "hello.db";
    String sJdbc = "jdbc:sqlite";
    int iTimeout = 30;
    String sDbUrl = sJdbc + ":" + sTempDb;
    String sMakeTable = "CREATE TABLE dummy (id numeric, response text)";
    String sMakeInsert = "INSERT INTO dummy VALUES(1,'Hello from the database')";
    String sMakeSelect = "SELECT response from dummy";
    Connection conn = DriverManager.getConnection(sDbUrl);
        try {
            Statement stmt = conn.createStatement();
            try {
                stmt.setQueryTimeout(iTimeout);
                stmt.executeUpdate( sMakeTable );
                stmt.executeUpdate( sMakeInsert );
                ResultSet rs = stmt.executeQuery(sMakeSelect);
                try {
                    while(rs.next())
                        {
                            String sResult = rs.getString("response");
                            System.out.println(sResult);
                        }
                } finally {
                    try { rs.close(); } catch (Exception ignore) {}
                }
            } finally {
                try { stmt.close(); } catch (Exception ignore) {}
            }
        } finally {
            try { conn.close(); } catch (Exception ignore) {}
        }

    try (BufferedReader br = new BufferedReader(new FileReader("ss10hco.csv"))) {
      String line;
      String [] categories = br.readLine().split(",");
      ArrayList<Integer> indexes = new ArrayList<Integer>();
      ArrayList<String> cats = new ArrayList<String>();
      boolean hasYear=true;
      int pumaIndex=2;
      //load categories
      for(int j=0; j<master.size(); j++){
        for (int i =0; i<categories.length; i++){
          if(categories[i].equals(master.get(j))){
            indexes.add(i);
            cats.add(master.get(j));
          }
        }
      }

      if (indexes.size()!= 16){
        //this is a file that doesn't have a year
        hasYear=false;
        pumaIndex=1;
      }

      //load each sql insert string
      while ((line = br.readLine()) != null) {
        String sqlString="";
        if(hasYear == false){sqlString="2010,";}

        String [] tokens = line.split(",");
        int x = 0;
        int whatever = Integer.valueOf(indexes.get(pumaIndex));
        for (int i =0 ; i<pumas.size();i++){
          if( tokens[whatever].matches("(0*)"+pumas.get(i))){
            for (int index : indexes){
              sqlString += tokens[index]+",";
            }
            System.out.println(sqlString);
          }
        }
      }
    }
  }
}
