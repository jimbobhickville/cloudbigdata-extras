/*
 * Copyright Rackspace Inc.
 * All Rights Reserved
 *
 *
 * The code in this project is made available as free and open source software under the terms and
 * conditions of the GNU Public License. For more information, please refer to the LICENSE text file included with this project,
 * or visit gnu.org if the license file was not included.
 * This SOFTWARE PRODUCT is provided by THE PROVIDER "as is" and "with all faults."
 * THE PROVIDER makes no representations or warranties of any kind concerning the
 * safety, suitability, lack of viruses, inaccuracies, typographical errors, or
 * other harmful components of this SOFTWARE PRODUCT. There are inherent dangers
 * in the use of any software, and you are solely responsible for determining
 * whether this SOFTWARE PRODUCT is compatible with your equipment and other
 * software installed on your equipment. You are also solely responsible for the
 * protection of your equipment and backup of your data, and THE PROVIDER will
 * not be liable for any damages you may suffer in connection with using,
 * modifying, or distributing this SOFTWARE PRODUCT.
 *
 * The code has been referred from here:https://github.com/zdata-inc/SparkSampleProject
 */

package com.rackspace.spark;

import org.apache.log4j.Logger;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Serializable;
import java.util.Set;
import java.util.HashSet;

public class PositiveWords implements Serializable {
    public static final long serialVersionUID = 42L;
    private Set<String> posWords;
    private static PositiveWords _singleton;

    private PositiveWords() {
        this.posWords = new HashSet<String>();
        BufferedReader rd = null;
        try {
            rd = new BufferedReader(
                    new InputStreamReader(
                            this.getClass().getResourceAsStream("/pos-words.txt")));
            String line;
            while ((line = rd.readLine()) != null)
                this.posWords.add(line);
        } catch (IOException ex) {
            Logger.getLogger(this.getClass())
                    .error("IO error while initializing", ex);
        } finally {
            try {
                if (rd != null) rd.close();
            } catch (IOException ex) {
            }
        }
    }

    private static PositiveWords get() {
        if (_singleton == null)
            _singleton = new PositiveWords();
        return _singleton;
    }

    public static Set<String> getWords() {
        return get().posWords;
    }
}
